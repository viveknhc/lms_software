from rest_framework import permissions, viewsets

from learning.models import Lesson, Section
from learning.serializers import LessonSerializer, SectionSerializer


class SectionViewSet(viewsets.ModelViewSet):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["course"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]


class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.select_related("section", "course").all()
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["section", "course", "content_type", "is_free"]
    ordering_fields = ["order", "created_at"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        # For unauthenticated or student users, show only free lessons if not enrolled
        # (Enrollment check can be added later when the full system is integrated)
        if not user.is_authenticated:
            qs = qs.filter(is_free=True)
        return qs
