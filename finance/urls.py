from django.urls import path
from rest_framework.routers import DefaultRouter

from finance.views import (
    InstructorSalaryViewSet,
    StudentFeeViewSet,
    accounts_dashboard,
)

router = DefaultRouter()
router.register(r"student-fees", StudentFeeViewSet, basename="finance-student-fee")
router.register(
    r"instructor-salaries", InstructorSalaryViewSet, basename="finance-instructor-salary"
)

urlpatterns = [
    path("accounts/dashboard/", accounts_dashboard, name="finance-accounts-dashboard"),
] + router.urls
