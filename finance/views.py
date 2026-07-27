from decimal import Decimal

from django.db.models import Sum
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from accounts.models import User
from finance.models import InstructorSalary, StudentFee
from finance.serializers import (
    AccountsDashboardSerializer,
    InstructorSalaryCreateSerializer,
    InstructorSalarySerializer,
    StudentFeeCreateSerializer,
    StudentFeeSerializer,
    StudentFeeUpdateSerializer,
)


class CanViewFinance(permissions.BasePermission):
    """Allow access only to admin and accounts roles."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in (
            "admin",
            "accounts",
        )


class StudentFeeViewSet(viewsets.ModelViewSet):
    queryset = StudentFee.objects.select_related("student").all()
    permission_classes = [permissions.IsAuthenticated, CanViewFinance]
    filterset_fields = ["status", "course", "student"]
    search_fields = ["student__username", "student__first_name", "student__last_name"]

    def get_serializer_class(self):
        if self.action == "create":
            return StudentFeeCreateSerializer
        elif self.action in ("partial_update", "update"):
            return StudentFeeUpdateSerializer
        return StudentFeeSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.role == "student":
            qs = qs.filter(student=user)
        return qs


class InstructorSalaryViewSet(viewsets.ModelViewSet):
    queryset = InstructorSalary.objects.select_related("instructor").all()
    permission_classes = [permissions.IsAuthenticated, CanViewFinance]
    filterset_fields = ["payment_status", "month", "year", "instructor"]
    search_fields = [
        "instructor__username",
        "instructor__first_name",
        "instructor__last_name",
    ]

    def get_serializer_class(self):
        if self.action == "create":
            return InstructorSalaryCreateSerializer
        return InstructorSalarySerializer


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def accounts_dashboard(request):
    """Dashboard data for accounts role: fee and salary summaries."""
    if request.user.role not in ("admin", "accounts"):
        return Response(
            {"detail": "Accounts or admin access required."},
            status=status.HTTP_403_FORBIDDEN,
        )

    # Fee statistics
    all_fees = StudentFee.objects.all()
    total_collected = all_fees.aggregate(total=Sum("paid_amount"))["total"] or Decimal("0")
    total_pending = all_fees.aggregate(
        total=Sum("total_fee") - Sum("paid_amount")
    )["total"] or Decimal("0")

    total_fee_value = all_fees.aggregate(total=Sum("total_fee"))["total"] or Decimal("0")
    collection_rate = (
        float(total_collected) / float(total_fee_value) * 100
        if total_fee_value > 0
        else 0
    )

    total_student_records = all_fees.values("student").distinct().count()
    students_outstanding = (
        all_fees.values("student")
        .annotate(due=Sum("total_fee") - Sum("paid_amount"))
        .filter(due__gt=0)
        .count()
    )

    # Salary statistics
    all_salaries = InstructorSalary.objects.all()
    total_paid_salary = sum(
        (s.net_salary for s in all_salaries.filter(payment_status="paid")),
        Decimal("0"),
    )
    total_pending_salary = sum(
        (s.net_salary for s in all_salaries.filter(payment_status="pending")),
        Decimal("0"),
    )

    total_instructor_records = all_salaries.values("instructor").distinct().count()
    instructors_pending = (
        all_salaries.filter(payment_status="pending")
        .values("instructor")
        .distinct()
        .count()
    )

    # Recent records
    recent_fees = StudentFee.objects.select_related("student", "course").order_by("-created_at")[:10]
    recent_salaries = InstructorSalary.objects.select_related("instructor").prefetch_related(
        "instructor__courses"
    ).order_by("-created_at")[:10]

    data = {
        "total_collected_fees": total_collected,
        "total_pending_fees": total_pending,
        "fee_collection_rate": round(collection_rate, 1),
        "total_students_with_fees": total_student_records,
        "students_with_outstanding": students_outstanding,
        "total_salary_paid": total_paid_salary,
        "total_salary_pending": total_pending_salary,
        "total_instructors_with_salary": total_instructor_records,
        "instructors_with_pending": instructors_pending,
        "recent_fees": StudentFeeSerializer(recent_fees, many=True).data,
        "recent_salaries": InstructorSalarySerializer(recent_salaries, many=True).data,
    }

    return Response(data)
