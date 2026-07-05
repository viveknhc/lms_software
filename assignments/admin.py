from django.contrib import admin

from assignments.models import Assignment, Grade, Submission


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ["title", "course", "section", "total_points", "due_date", "is_published", "created_at"]
    list_filter = ["is_published", "course"]
    search_fields = ["title", "description"]
    date_hierarchy = "due_date"


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ["assignment", "student", "status", "submitted_at"]
    list_filter = ["status", "assignment"]
    search_fields = ["student__username", "assignment__title"]
    date_hierarchy = "submitted_at"


@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ["submission", "graded_by", "points_earned", "is_passed", "graded_at"]
    list_filter = ["is_passed"]
    search_fields = ["submission__student__username", "submission__assignment__title"]
