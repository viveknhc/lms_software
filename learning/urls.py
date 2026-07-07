from django.urls import include, path
from rest_framework.routers import DefaultRouter

from learning.views import LessonViewSet, SectionViewSet, upload_video_chunk

router = DefaultRouter()
router.register(r"sections", SectionViewSet, basename="learning-section")
router.register(r"lessons", LessonViewSet, basename="lesson")

urlpatterns = [
    path("upload-video/", upload_video_chunk, name="upload-video-chunk"),
    path("", include(router.urls)),
]
