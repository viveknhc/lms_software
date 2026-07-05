from rest_framework import serializers

from enrollments.models import CourseProgress, Enrollment, LessonProgress


class EnrollmentSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField(read_only=True)
    course_title = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Enrollment
        fields = [
            "id",
            "student",
            "student_name",
            "course",
            "course_title",
            "enrolled_at",
            "status",
        ]
        read_only_fields = ["id", "enrolled_at"]

    def get_student_name(self, obj):
        return str(obj.student)

    def get_course_title(self, obj):
        return str(obj.course)


class CourseProgressSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField(read_only=True)
    course_title = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = CourseProgress
        fields = [
            "id",
            "student",
            "student_name",
            "course",
            "course_title",
            "enrollment",
            "completion_percentage",
            "is_completed",
            "last_accessed",
        ]
        read_only_fields = ["id", "last_accessed"]

    def get_student_name(self, obj):
        return str(obj.student)

    def get_course_title(self, obj):
        return str(obj.course)


class LessonProgressSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField(read_only=True)
    lesson_title = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = LessonProgress
        fields = [
            "id",
            "student",
            "student_name",
            "lesson",
            "lesson_title",
            "course",
            "enrollment",
            "is_completed",
            "time_spent_minutes",
            "completed_at",
        ]
        read_only_fields = ["id", "completed_at"]

    def get_student_name(self, obj):
        return str(obj.student)

    def get_lesson_title(self, obj):
        return str(obj.lesson)
