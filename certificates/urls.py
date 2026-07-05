from django.urls import include, path
from rest_framework.routers import DefaultRouter

from certificates.views import (
    CertificateTemplateViewSet,
    CertificateViewSet,
    VerificationViewSet,
)

router = DefaultRouter()
router.register(r"certificates", CertificateViewSet, basename="certificate")
router.register(r"templates", CertificateTemplateViewSet, basename="certificate-template")
router.register(r"verifications", VerificationViewSet, basename="verification")

urlpatterns = [
    path("", include(router.urls)),
]
