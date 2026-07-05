from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response

from django.utils import timezone

from assignments.models import Assignment, Grade, Submission
from assignments.serializers import (
    AssignmentSerializer,
    GradeSerializer,
    SubmissionSerializer,
    SubmissionSubmitSerializer,
)
from enrollments.models import Enrollment


class IsInstructorOrAdmin(permissions.BasePermission):
    """Allow access only to instructors and admins."""

    def has_permission(self, request, view):
        role = getattr(request.user, "role", None)
        return role in ("instructor", "admin")


class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.select_related("course", "section").all()
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["course", "section", "is_published"]
    search_fields = ["title", "description"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsInstructorOrAdmin()]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not user.is_authenticated or getattr(user, "role", None) in ("student", None):
            qs = qs.filter(is_published=True)
        return qs


class SubmissionViewSet(viewsets.ModelViewSet):
    queryset = Submission.objects.select_related(
        "assignment", "student"
    ).prefetch_related("grade").all()
    serializer_class = SubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["assignment", "status"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.role == "student":
            qs = qs.filter(student=user)
        elif user.role == "instructor":
            qs = qs.filter(assignment__course__instructor=user)
        return qs

    @action(detail=False, methods=["post"])
    def submit(self, request):
        """Submit an assignment (create or update existing submission)."""
        assignment_id = request.data.get("assignment_id")
        if not assignment_id:
            raise ValidationError({"assignment_id": "This field is required."})

        try:
            assignment = Assignment.objects.get(id=assignment_id, is_published=True)
        except Assignment.DoesNotExist:
            raise ValidationError({"assignment_id": "Assignment not found or not published."})

        user = request.user

        if user.role == "student":
            is_enrolled = Enrollment.objects.filter(
                student=user, course=assignment.course, status="active"
            ).exists()
            if not is_enrolled:
                raise PermissionDenied("You are not enrolled in this course.")

        # Check if submission already exists
        submission, created = Submission.objects.get_or_create(
            assignment=assignment,
            student=user,
            defaults={"status": Submission.Status.SUBMITTED},
        )

        if not created and submission.status == Submission.Status.GRADED:
            raise ValidationError("This submission has already been graded and cannot be resubmitted.")

        serializer = SubmissionSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if serializer.validated_data.get("content") is not None:
            submission.content = serializer.validated_data["content"]
        if serializer.validated_data.get("attachment") is not None:
            submission.attachment = serializer.validated_data["attachment"]

        # Check if submission is late
        if assignment.due_date and timezone.now() > assignment.due_date:
            submission.status = Submission.Status.LATE
        else:
            submission.status = Submission.Status.SUBMITTED
        submission.save()

        result = SubmissionSerializer(submission, context={"request": request})
        return Response(result.data, status=status.HTTP_200_OK if not created else status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def grade(self, request, pk=None):
        """Grade a submission (instructor only)."""
        submission = self.get_object()

        if request.user.role not in ("instructor", "admin"):
            raise PermissionDenied("Only instructors can grade submissions.")

        points_earned = request.data.get("points_earned")
        feedback = request.data.get("feedback", "")

        if points_earned is None:
            raise ValidationError({"points_earned": "This field is required."})

        try:
            points_earned = float(points_earned)
        except (TypeError, ValueError):
            raise ValidationError({"points_earned": "Must be a valid number."})

        if points_earned < 0:
            raise ValidationError({"points_earned": "Must be a non-negative number."})

        total_points = submission.assignment.total_points
        is_passed = points_earned >= (total_points * 0.5)  # 50% to pass

        grade, created = Grade.objects.update_or_create(
            submission=submission,
            defaults={
                "graded_by": request.user,
                "points_earned": points_earned,
                "feedback": feedback,
                "is_passed": is_passed,
            },
        )

        submission.status = Submission.Status.GRADED
        submission.save()

        serializer = GradeSerializer(grade)
        return Response(serializer.data)


class GradeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Grade.objects.select_related(
        "submission__assignment", "submission__student", "graded_by"
    ).all()
    serializer_class = GradeSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["submission", "is_passed"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.role == "student":
            qs = qs.filter(submission__student=user)
        elif user.role == "instructor":
            qs = qs.filter(submission__assignment__course__instructor=user)
        return qs
