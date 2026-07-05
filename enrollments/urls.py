from django.urls import include, path
from rest_framework.routers import DefaultRouter

from enrollments.views import (
    CourseProgressViewSet,
    EnrollmentViewSet,
    LessonProgressViewSet,
)

router = DefaultRouter()
router.register(r"enrollments", EnrollmentViewSet, basename="enrollment")
router.register(r"course-progress", CourseProgressViewSet, basename="course-progress")
router.register(r"lesson-progress", LessonProgressViewSet, basename="lesson-progress")

urlpatterns = [
    path("", include(router.urls)),
]
