from django.contrib import admin

from learning.models import Lesson, Section


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ["title", "course", "order"]
    list_filter = ["course"]
    ordering = ["course", "order"]


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ["title", "section", "course", "content_type", "duration_minutes", "order", "is_free"]
    list_filter = ["content_type", "is_free", "course"]
    search_fields = ["title", "content"]
    ordering = ["section", "order"]
