from django.urls import include, path
from rest_framework.routers import DefaultRouter

from assignments.views import AssignmentViewSet, GradeViewSet, SubmissionViewSet

router = DefaultRouter()
router.register(r"assignments", AssignmentViewSet, basename="assignment")
router.register(r"submissions", SubmissionViewSet, basename="submission")
router.register(r"grades", GradeViewSet, basename="grade")

urlpatterns = [
    path("", include(router.urls)),
]
