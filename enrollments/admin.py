from django.contrib import admin

from enrollments.models import CourseProgress, Enrollment, LessonProgress


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ["student", "course", "status", "enrolled_at"]
    list_filter = ["status"]
    search_fields = ["student__username", "student__email", "course__title"]
    date_hierarchy = "enrolled_at"


@admin.register(CourseProgress)
class CourseProgressAdmin(admin.ModelAdmin):
    list_display = ["student", "course", "completion_percentage", "is_completed", "last_accessed"]
    list_filter = ["is_completed"]
    search_fields = ["student__username", "course__title"]


@admin.register(LessonProgress)
class LessonProgressAdmin(admin.ModelAdmin):
    list_display = ["student", "lesson", "course", "is_completed", "time_spent_minutes"]
    list_filter = ["is_completed"]
    search_fields = ["student__username"]
