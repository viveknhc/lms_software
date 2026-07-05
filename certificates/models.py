import uuid

from django.db import models


class CertificateTemplate(models.Model):
    name = models.CharField(max_length=200, verbose_name="Template Name")
    description = models.TextField(blank=True, verbose_name="Description")
    background_image = models.ImageField(
        upload_to="certificate_templates/",
        blank=True,
        null=True,
        verbose_name="Background Image",
    )
    layout_config = models.JSONField(
        default=dict,
        blank=True,
        verbose_name="Layout Configuration",
        help_text="JSON config for text positioning, fonts, colors, etc.",
    )
    is_active = models.BooleanField(default=True, verbose_name="Is Active")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated At")

    class Meta:
        db_table = "certificate_templates"
        verbose_name = "Certificate Template"
        verbose_name_plural = "Certificate Templates"

    def __str__(self):
        return self.name


class Certificate(models.Model):
    enrollment = models.OneToOneField(
        "enrollments.Enrollment",
        on_delete=models.CASCADE,
        related_name="certificate",
        verbose_name="Enrollment",
    )
    student = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="certificates",
        verbose_name="Student",
    )
    course = models.ForeignKey(
        "courses.Course",
        on_delete=models.CASCADE,
        related_name="certificates",
        verbose_name="Course",
    )
    template = models.ForeignKey(
        CertificateTemplate,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="certificates",
        verbose_name="Template",
    )
    certificate_id = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False,
        verbose_name="Certificate ID",
    )
    verification_code = models.CharField(
        max_length=64,
        unique=True,
        editable=False,
        verbose_name="Verification Code",
    )
    issued_at = models.DateTimeField(auto_now_add=True, verbose_name="Issued At")
    expires_at = models.DateTimeField(
        null=True, blank=True, verbose_name="Expires At"
    )
    is_revoked = models.BooleanField(default=False, verbose_name="Is Revoked")
    pdf_file = models.FileField(
        upload_to="certificates/",
        blank=True,
        null=True,
        verbose_name="PDF File",
    )

    class Meta:
        db_table = "certificates"
        verbose_name = "Certificate"
        verbose_name_plural = "Certificates"
        ordering = ["-issued_at"]

    def __str__(self):
        return f"{self.student.username} - {self.course.title}"

    def save(self, *args, **kwargs):
        if not self.verification_code:
            self.verification_code = uuid.uuid4().hex[:16]
        super().save(*args, **kwargs)


class Verification(models.Model):
    certificate = models.ForeignKey(
        Certificate,
        on_delete=models.CASCADE,
        related_name="verifications",
        verbose_name="Certificate",
    )
    verified_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="certificate_verifications",
        verbose_name="Verified By",
    )
    ip_address = models.GenericIPAddressField(
        blank=True, null=True, verbose_name="IP Address"
    )
    user_agent = models.TextField(blank=True, verbose_name="User Agent")
    is_valid = models.BooleanField(default=True, verbose_name="Is Valid")
    verified_at = models.DateTimeField(auto_now_add=True, verbose_name="Verified At")

    class Meta:
        db_table = "certificate_verifications"
        verbose_name = "Certificate Verification"
        verbose_name_plural = "Certificate Verifications"
        ordering = ["-verified_at"]

    def __str__(self):
        return f"Verification of {self.certificate.certificate_id} at {self.verified_at}"
