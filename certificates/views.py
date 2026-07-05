import uuid

from django.db import transaction
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response

from certificates.models import Certificate, CertificateTemplate, Verification
from certificates.serializers import (
    CertificateIssueSerializer,
    CertificateSerializer,
    CertificateTemplateSerializer,
    CertificateVerifySerializer,
    VerificationSerializer,
)
from enrollments.models import Enrollment


class IsInstructorOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        role = getattr(request.user, "role", None)
        return role in ("instructor", "admin")


class CertificateTemplateViewSet(viewsets.ModelViewSet):
    queryset = CertificateTemplate.objects.all()
    serializer_class = CertificateTemplateSerializer
    permission_classes = [permissions.IsAuthenticated, IsInstructorOrAdmin]
    search_fields = ["name", "description"]


class CertificateViewSet(viewsets.ModelViewSet):
    queryset = Certificate.objects.select_related(
        "enrollment", "student", "course", "template"
    ).all()
    serializer_class = CertificateSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["course", "is_revoked"]
    search_fields = ["student__username", "course__title", "verification_code"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.role == "student":
            qs = qs.filter(student=user)
        elif user.role == "instructor":
            qs = qs.filter(course__instructor=user)
        return qs

    @action(detail=False, methods=["post"])
    def issue(self, request):
        """Issue a certificate for a completed enrollment."""
        serializer = CertificateIssueSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            enrollment = Enrollment.objects.select_related(
                "student", "course"
            ).get(id=serializer.validated_data["enrollment_id"])
        except Enrollment.DoesNotExist:
            raise ValidationError({"enrollment_id": "Enrollment not found."})

        # Only instructors of the course or admins can issue certificates
        if request.user.role == "instructor" and enrollment.course.instructor != request.user:
            raise PermissionDenied("You are not the instructor of this course.")

        if enrollment.status != Enrollment.Status.COMPLETED:
            raise ValidationError(
                "Certificate can only be issued for completed enrollments."
            )

        # Check if certificate already exists
        if hasattr(enrollment, "certificate"):
            certificate = enrollment.certificate
            if not certificate.is_revoked:
                raise ValidationError(
                    "A certificate has already been issued for this enrollment."
                )
            # Re-issue by un-revoking
            certificate.is_revoked = False
            certificate.save()
            result = self.get_serializer(certificate)
            return Response(result.data)

        template_id = serializer.validated_data.get("template_id")
        template = None
        if template_id:
            try:
                template = CertificateTemplate.objects.get(id=template_id, is_active=True)
            except CertificateTemplate.DoesNotExist:
                raise ValidationError({"template_id": "Template not found or inactive."})

        certificate = Certificate.objects.create(
            enrollment=enrollment,
            student=enrollment.student,
            course=enrollment.course,
            template=template,
        )
        result = self.get_serializer(certificate)
        return Response(result.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"])
    def verify(self, request):
        """Verify a certificate by its verification code."""
        serializer = CertificateVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            certificate = Certificate.objects.select_related(
                "student", "course"
            ).get(
                verification_code=serializer.validated_data["verification_code"],
                is_revoked=False,
            )
        except Certificate.DoesNotExist:
            return Response(
                {
                    "is_valid": False,
                    "message": "Certificate not found or has been revoked.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # Log verification
        Verification.objects.create(
            certificate=certificate,
            verified_by=request.user if request.user.is_authenticated else None,
            ip_address=request.META.get("REMOTE_ADDR"),
            user_agent=request.META.get("HTTP_USER_AGENT", ""),
            is_valid=True,
        )

        return Response(
            {
                "is_valid": True,
                "certificate_id": str(certificate.certificate_id),
                "student_name": str(certificate.student),
                "course_title": certificate.course.title,
                "issued_at": certificate.issued_at,
            }
        )

    @action(detail=True, methods=["post"])
    def revoke(self, request, pk=None):
        """Revoke a certificate."""
        certificate = self.get_object()

        if request.user.role == "instructor" and certificate.course.instructor != request.user:
            raise PermissionDenied("You cannot revoke this certificate.")

        certificate.is_revoked = True
        certificate.save()
        return Response({"detail": "Certificate revoked successfully."})

    @action(detail=False, methods=["get"])
    def my_certificates(self, request):
        """Get current user's certificates."""
        certificates = self.get_queryset().filter(student=request.user)
        serializer = self.get_serializer(certificates, many=True)
        return Response(serializer.data)


class VerificationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Verification.objects.select_related(
        "certificate", "verified_by"
    ).all()
    serializer_class = VerificationSerializer
    permission_classes = [permissions.IsAuthenticated, IsInstructorOrAdmin]
    filterset_fields = ["certificate", "is_valid"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.role == "instructor":
            qs = qs.filter(certificate__course__instructor=user)
        return qs
