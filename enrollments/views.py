from rest_framework import permissions, viewsets

from enrollments.models import CourseProgress, Enrollment, LessonProgress
from enrollments.serializers import (
    CourseProgressSerializer,
    EnrollmentSerializer,
    LessonProgressSerializer,
)


class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.select_related("student", "course").all()
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["status", "course"]
    search_fields = ["student__username", "student__email", "course__title"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.role == "student":
            qs = qs.filter(student=user)
        return qs


class CourseProgressViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CourseProgress.objects.select_related("student", "course", "enrollment").all()
    serializer_class = CourseProgressSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["is_completed", "course"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.role == "student":
            qs = qs.filter(student=user)
        return qs


class LessonProgressViewSet(viewsets.ModelViewSet):
    queryset = LessonProgress.objects.select_related(
        "student", "lesson", "course", "enrollment"
    ).all()
    serializer_class = LessonProgressSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["is_completed", "course", "lesson"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.role == "student":
            qs = qs.filter(student=user)
        return qs

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)
