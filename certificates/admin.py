from django.contrib import admin

from certificates.models import Certificate, CertificateTemplate, Verification


@admin.register(CertificateTemplate)
class CertificateTemplateAdmin(admin.ModelAdmin):
    list_display = ["name", "is_active", "created_at"]
    list_filter = ["is_active"]
    search_fields = ["name", "description"]


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = [
        "student",
        "course",
        "certificate_id",
        "verification_code",
        "issued_at",
        "is_revoked",
    ]
    list_filter = ["is_revoked", "course"]
    search_fields = ["student__username", "course__title", "verification_code"]
    date_hierarchy = "issued_at"


@admin.register(Verification)
class VerificationAdmin(admin.ModelAdmin):
    list_display = ["certificate", "verified_by", "is_valid", "verified_at"]
    list_filter = ["is_valid"]
    date_hierarchy = "verified_at"
