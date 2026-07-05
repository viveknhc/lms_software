from django.urls import include, path
from rest_framework.routers import DefaultRouter

from notifications.views import (
    NotificationTemplateViewSet,
    NotificationViewSet,
)

router = DefaultRouter()
router.register(r"notifications", NotificationViewSet, basename="notification")
router.register(r"templates", NotificationTemplateViewSet, basename="notification-template")

urlpatterns = [
    path("", include(router.urls)),
]
