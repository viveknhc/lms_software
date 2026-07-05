from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from accounts.models import User
from notifications.models import Notification, NotificationTemplate
from notifications.serializers import (
    NotificationMarkReadSerializer,
    NotificationSerializer,
    NotificationTemplateSerializer,
)


class IsAdminOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        role = getattr(request.user, "role", None)
        return role == "admin"


class NotificationTemplateViewSet(viewsets.ModelViewSet):
    queryset = NotificationTemplate.objects.all()
    serializer_class = NotificationTemplateSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOnly]
    search_fields = ["name", "subject", "body"]


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.select_related("recipient").all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["notification_type", "is_read"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        # Users can only see their own notifications
        qs = qs.filter(recipient=user)
        return qs

    def perform_create(self, serializer):
        serializer.save(recipient=self.request.user)

    @action(detail=False, methods=["get"])
    def unread_count(self, request):
        """Get the count of unread notifications for the current user."""
        count = self.get_queryset().filter(is_read=False).count()
        return Response({"unread_count": count})

    @action(detail=False, methods=["post"])
    def mark_read(self, request):
        """Mark notifications as read."""
        serializer = NotificationMarkReadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        notification_ids = serializer.validated_data.get("notification_ids")
        qs = self.get_queryset()

        if notification_ids:
            qs = qs.filter(id__in=notification_ids)

        updated = qs.filter(is_read=False).update(
            is_read=True, read_at=timezone.now()
        )
        return Response({"marked_read": updated})

    @action(detail=False, methods=["post"])
    def send_bulk(self, request):
        """Send a notification to multiple users (admin/instructor only)."""
        user = request.user
        if user.role not in ("admin", "instructor"):
            return Response(
                {"detail": "Only admins and instructors can send bulk notifications."},
                status=status.HTTP_403_FORBIDDEN,
            )

        title = request.data.get("title")
        message = request.data.get("message")
        recipient_ids = request.data.get("recipient_ids", [])

        if not title or not message:
            return Response(
                {"detail": "Title and message are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not recipient_ids:
            return Response(
                {"detail": "At least one recipient_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        existing_ids = set(
            User.objects.filter(id__in=recipient_ids).values_list("id", flat=True)
        )
        invalid_ids = set(recipient_ids) - existing_ids
        if invalid_ids:
            return Response(
                {
                    "detail": f"Invalid recipient IDs: {sorted(invalid_ids)}",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        notifications = [
            Notification(
                recipient_id=rid,
                title=title,
                message=message,
                notification_type=Notification.NotificationType.IN_APP,
            )
            for rid in existing_ids
        ]

        created = Notification.objects.bulk_create(notifications)
        return Response(
            {"created": len(created)},
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=["delete"])
    def clear_all(self, request):
        """Delete all notifications for the current user."""
        qs = self.get_queryset()
        count = qs.count()
        qs.delete()
        return Response({"deleted": count})
