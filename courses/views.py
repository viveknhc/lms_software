from django.shortcuts import get_object_or_404
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from courses.models import Category, Course
from courses.serializers import CategorySerializer, CourseSerializer
from learning.models import Section
from learning.serializers import SectionSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "slug"

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.select_related("category", "instructor").all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "slug"
    filterset_fields = ["status", "category"]
    search_fields = ["title", "description", "short_description"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_object(self):
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        lookup_value = self.kwargs.get(lookup_url_kwarg)
        queryset = self.filter_queryset(self.get_queryset())
        if lookup_value and lookup_value.isdigit():
            obj = get_object_or_404(queryset, pk=lookup_value)
        else:
            obj = get_object_or_404(queryset, slug=lookup_value)
        self.check_object_permissions(self.request, obj)
        return obj

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        # Students and guests see only published courses
        if not user.is_authenticated or getattr(user, "role", None) in ("student", None):
            qs = qs.filter(status=Course.Status.PUBLISHED)
        # Instructors see their own courses (draft + published)
        elif user.role == "instructor" and self.action in ("list",):
            qs = qs.filter(instructor=user)
        return qs

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)

    @action(detail=True, methods=["get"])
    def sections(self, request, slug=None):
        course = self.get_object()
        sections = Section.objects.filter(course=course)
        serializer = SectionSerializer(sections, many=True)
        return Response(serializer.data)
