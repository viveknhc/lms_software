from django.urls import path
from rest_framework.routers import DefaultRouter

from analytics.views import (
    ActivityLogViewSet,
    admin_dashboard,
    instructor_dashboard,
    student_dashboard,
)

router = DefaultRouter()
router.register(r"logs", ActivityLogViewSet, basename="analytics-log")

urlpatterns = [
    path("dashboard/student/", student_dashboard, name="analytics-student-dashboard"),
    path("dashboard/instructor/", instructor_dashboard, name="analytics-instructor-dashboard"),
    path("dashboard/admin/", admin_dashboard, name="analytics-admin-dashboard"),
] + router.urls
