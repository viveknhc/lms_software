from rest_framework import serializers

from notifications.models import Notification, NotificationTemplate


class NotificationTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationTemplate
        fields = [
            "id",
            "name",
            "subject",
            "body",
            "notification_type",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class NotificationSerializer(serializers.ModelSerializer):
    recipient_name = serializers.SerializerMethodField(read_only=True)
    time_ago = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Notification
        fields = [
            "id",
            "recipient",
            "recipient_name",
            "title",
            "message",
            "notification_type",
            "link",
            "template",
            "is_read",
            "read_at",
            "time_ago",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "recipient",
            "read_at",
            "created_at",
        ]

    def get_recipient_name(self, obj):
        return str(obj.recipient)

    def get_time_ago(self, obj):
        from django.utils import timezone
        from django.utils.timesince import timesince

        return timesince(obj.created_at, timezone.now())


class NotificationMarkReadSerializer(serializers.Serializer):
    """Mark one or more notifications as read."""
    notification_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        help_text="List of notification IDs. Leave empty to mark all as read.",
    )

    def validate_notification_ids(self, value):
        if value is not None and not value:
            return None  # Empty list = mark all
        return value
