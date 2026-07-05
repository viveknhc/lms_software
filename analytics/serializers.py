from rest_framework import serializers

from analytics.models import ActivityLog


class ActivityLogSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField(read_only=True)
    user_role = serializers.SerializerMethodField(read_only=True)
    time_ago = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ActivityLog
        fields = [
            "id",
            "user",
            "user_name",
            "user_role",
            "action_type",
            "description",
            "metadata",
            "time_ago",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def get_user_name(self, obj):
        return str(obj.user)

    def get_user_role(self, obj):
        return obj.user.role if obj.user else None

    def get_time_ago(self, obj):
        from django.utils import timezone
        from django.utils.timesince import timesince
        return timesince(obj.created_at, timezone.now())
