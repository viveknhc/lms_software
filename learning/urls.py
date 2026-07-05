from django.urls import include, path
from rest_framework.routers import DefaultRouter

from learning.views import LessonViewSet, SectionViewSet

router = DefaultRouter()
router.register(r"sections", SectionViewSet, basename="learning-section")
router.register(r"lessons", LessonViewSet, basename="lesson")

urlpatterns = [
    path("", include(router.urls)),
]
