from rest_framework import serializers

from courses.models import Category, Course


class CategorySerializer(serializers.ModelSerializer):
    course_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "description", "course_count", "created_at"]
        read_only_fields = ["id", "slug", "created_at"]

    def get_course_count(self, obj):
        return obj.courses.count()


class CourseSerializer(serializers.ModelSerializer):
    instructor_name = serializers.SerializerMethodField(read_only=True)
    category_name = serializers.SerializerMethodField(read_only=True)
    section_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Course
        fields = [
            "id",
            "title",
            "slug",
            "description",
            "short_description",
            "category",
            "category_name",
            "instructor",
            "instructor_name",
            "price",
            "thumbnail",
            "status",
            "section_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "slug", "created_at", "updated_at"]

    def get_instructor_name(self, obj):
        return str(obj.instructor)

    def get_category_name(self, obj):
        return obj.category.name if obj.category else None

    def get_section_count(self, obj):
        return obj.learning_sections.count()
