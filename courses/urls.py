from django.urls import include, path
from rest_framework.routers import DefaultRouter

from courses.views import CategoryViewSet, CourseViewSet

router = DefaultRouter()
router.register(r"categories", CategoryViewSet, basename="category")
router.register(r"courses", CourseViewSet, basename="course")

urlpatterns = [
    path("", include(router.urls)),
]
