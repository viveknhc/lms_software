from django.contrib import admin

from notifications.models import Notification, NotificationTemplate


@admin.register(NotificationTemplate)
class NotificationTemplateAdmin(admin.ModelAdmin):
    list_display = ["name", "subject", "notification_type", "is_active", "created_at"]
    list_filter = ["notification_type", "is_active"]
    search_fields = ["name", "subject", "body"]


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ["recipient", "title", "notification_type", "is_read", "created_at"]
    list_filter = ["notification_type", "is_read"]
    search_fields = ["recipient__username", "recipient__email", "title", "message"]
    date_hierarchy = "created_at"
