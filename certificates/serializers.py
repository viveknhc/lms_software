from rest_framework import serializers

from certificates.models import Certificate, CertificateTemplate, Verification


class CertificateTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CertificateTemplate
        fields = [
            "id",
            "name",
            "description",
            "background_image",
            "layout_config",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class CertificateSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField(read_only=True)
    course_title = serializers.SerializerMethodField(read_only=True)
    template_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Certificate
        fields = [
            "id",
            "enrollment",
            "student",
            "student_name",
            "course",
            "course_title",
            "template",
            "template_name",
            "certificate_id",
            "verification_code",
            "issued_at",
            "expires_at",
            "is_revoked",
            "pdf_file",
        ]
        read_only_fields = [
            "id",
            "student",
            "certificate_id",
            "verification_code",
            "issued_at",
        ]

    def get_student_name(self, obj):
        return str(obj.student) if obj.student else None

    def get_course_title(self, obj):
        return obj.course.title if obj.course else None

    def get_template_name(self, obj):
        return obj.template.name if obj.template else None


class VerificationSerializer(serializers.ModelSerializer):
    certificate_details = CertificateSerializer(
        source="certificate", read_only=True
    )

    class Meta:
        model = Verification
        fields = [
            "id",
            "certificate",
            "certificate_details",
            "verified_by",
            "ip_address",
            "user_agent",
            "is_valid",
            "verified_at",
        ]
        read_only_fields = ["id", "verified_at"]


class CertificateVerifySerializer(serializers.Serializer):
    """Verify a certificate by its verification code."""
    verification_code = serializers.CharField(max_length=64)


class CertificateIssueSerializer(serializers.Serializer):
    """Issue a certificate for a completed enrollment."""
    enrollment_id = serializers.IntegerField()
    template_id = serializers.IntegerField(required=False, allow_null=True)
