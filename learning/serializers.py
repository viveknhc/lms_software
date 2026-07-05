from rest_framework import serializers

from learning.models import Lesson, Section


class SectionSerializer(serializers.ModelSerializer):
    lesson_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Section
        fields = ["id", "course", "title", "order", "lesson_count", "created_at"]
        read_only_fields = ["id", "created_at"]

    def get_lesson_count(self, obj):
        return obj.lessons.count()


class LessonSerializer(serializers.ModelSerializer):
    section_title = serializers.SerializerMethodField(read_only=True)
    course_title = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Lesson
        fields = [
            "id",
            "section",
            "section_title",
            "course",
            "course_title",
            "title",
            "content_type",
            "video_url",
            "content",
            "duration_minutes",
            "order",
            "is_free",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_section_title(self, obj):
        return obj.section.title if obj.section else None

    def get_course_title(self, obj):
        return obj.course.title if obj.course else None
