from django.contrib import admin

from analytics.models import ActivityLog


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "action_type", "description", "created_at"]
    list_filter = ["action_type", "created_at"]
    search_fields = ["user__username", "user__email", "description"]
    readonly_fields = ["created_at"]
    date_hierarchy = "created_at"
