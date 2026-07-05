from collections import Counter
from datetime import timedelta

from django.db.models import Avg, Count, Q, Sum
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from accounts.models import User
from analytics.models import ActivityLog
from analytics.serializers import ActivityLogSerializer
from assessments.models import Attempt
from assignments.models import Grade, Submission
from certificates.models import Certificate
from courses.models import Course
from enrollments.models import Enrollment
from payments.models import Order, Payment


class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ActivityLog.objects.select_related("user").all()
    serializer_class = ActivityLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["action_type", "user"]
    search_fields = ["description", "user__username"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user

        # Filter by date range if provided
        days = self.request.query_params.get("days")
        if days:
            try:
                cutoff = timezone.now() - timedelta(days=int(days))
                qs = qs.filter(created_at__gte=cutoff)
            except (ValueError, TypeError):
                pass

        if user.role == "student":
            qs = qs.filter(user=user)
        elif user.role == "instructor":
            # Instructors see their own activity + activity on their courses
            course_ids = list(
                Course.objects.filter(instructor=user).values_list("id", flat=True)
            )
            qs = qs.filter(
                Q(user=user)
                | Q(metadata__course_id__in=[str(cid) for cid in course_ids])
            )
        return qs


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def student_dashboard(request):
    """Dashboard data for students: progress, scores, certificates, activity."""
    user = request.user
    today = timezone.now()
    week_ago = today - timedelta(days=7)

    enrollments = Enrollment.objects.filter(student=user)
    total_enrolled = enrollments.count()
    completed_enrollments = enrollments.filter(status=Enrollment.Status.COMPLETED).count()
    active_enrollments = enrollments.filter(status=Enrollment.Status.ACTIVE).count()

    # Course progress
    progress_data = enrollments.select_related("progress").all()
    completion_pcts = [
        p.progress.completion_percentage
        for p in progress_data
        if hasattr(p, "progress") and p.progress
    ]
    avg_completion = float(sum(completion_pcts) / len(completion_pcts)) if completion_pcts else 0

    # Recent courses with progress
    recent_courses = []
    for enrollment in enrollments.select_related("course", "progress").order_by("-enrolled_at")[:5]:
        recent_courses.append({
            "course_id": enrollment.course.id,
            "course_title": enrollment.course.title,
            "course_slug": enrollment.course.slug,
            "status": enrollment.status,
            "completion_pct": float(enrollment.progress.completion_percentage)
            if hasattr(enrollment, "progress") and enrollment.progress else 0,
            "enrolled_at": enrollment.enrolled_at,
        })

    # Quiz performance
    quiz_attempts = Attempt.objects.filter(student=user, status=Attempt.Status.SUBMITTED)
    total_quizzes_taken = quiz_attempts.count()
    avg_quiz_score = quiz_attempts.aggregate(avg=Avg("score"))["avg"] or 0
    passed_quizzes = quiz_attempts.filter(is_passed=True).count()

    # Assignment grades
    submissions = Submission.objects.filter(
        student=user, status=Submission.Status.GRADED
    )
    grades = Grade.objects.filter(submission__in=submissions)
    total_assignments_graded = grades.count()
    avg_grade = grades.aggregate(avg=Avg("points_earned"))["avg"] or 0
    passed_assignments = grades.filter(is_passed=True).count()

    # Certificates
    certificates_count = Certificate.objects.filter(student=user, is_revoked=False).count()

    # Recent activity
    recent_activity = ActivityLog.objects.filter(user=user)[:10]
    activity_data = ActivityLogSerializer(recent_activity, many=True, context={"request": request}).data

    return Response({
        "enrollments": {
            "total": total_enrolled,
            "active": active_enrollments,
            "completed": completed_enrollments,
            "avg_completion_pct": round(avg_completion, 1),
        },
        "recent_courses": recent_courses,
        "quizzes": {
            "total_taken": total_quizzes_taken,
            "avg_score": round(float(avg_quiz_score), 1),
            "passed": passed_quizzes,
        },
        "assignments": {
            "total_graded": total_assignments_graded,
            "avg_grade": round(float(avg_grade), 1),
            "passed": passed_assignments,
        },
        "certificates_earned": certificates_count,
        "recent_activity": activity_data,
    })


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def instructor_dashboard(request):
    """Dashboard data for instructors: course stats, enrollments, revenue."""
    if request.user.role not in ("instructor", "admin"):
        return Response(
            {"detail": "Instructor or admin access required."},
            status=status.HTTP_403_FORBIDDEN,
        )
    user = request.user
    today = timezone.now()
    week_ago = today - timedelta(days=7)

    courses = Course.objects.filter(instructor=user)
    total_courses = courses.count()
    published_courses = courses.filter(status=Course.Status.PUBLISHED).count()
    draft_courses = courses.filter(status=Course.Status.DRAFT).count()

    # Enrollment stats
    enrollments = Enrollment.objects.filter(course__instructor=user)
    total_enrollments = enrollments.count()
    active_enrollments = enrollments.filter(status=Enrollment.Status.ACTIVE).count()
    completed_enrollments = enrollments.filter(status=Enrollment.Status.COMPLETED).count()
    recent_enrollments = enrollments.filter(enrolled_at__gte=week_ago).count()

    # Completion rate
    completion_rate = (
        (completed_enrollments / total_enrollments * 100)
        if total_enrollments > 0 else 0
    )

    # Course breakdown
    course_breakdown = []
    for course in courses.prefetch_related("enrollments", "course_progress"):
        course_enrollments = course.enrollments.all()
        course_completed = course_enrollments.filter(
            status=Enrollment.Status.COMPLETED
        ).count()
        course_active = course_enrollments.filter(
            status=Enrollment.Status.ACTIVE
        ).count()

        # Average progress
        progress_qs = course.course_progress.all()
        avg_progress = (
            progress_qs.aggregate(avg=Avg("completion_percentage"))["avg"] or 0
        )

        course_breakdown.append({
            "course_id": course.id,
            "title": course.title,
            "slug": course.slug,
            "status": course.status,
            "total_enrollments": course_enrollments.count(),
            "active": course_active,
            "completed": course_completed,
            "avg_completion_pct": round(float(avg_progress), 1),
        })

    # Revenue
    revenue_data = Order.objects.filter(
        course__instructor=user, status=Order.Status.COMPLETED
    )
    total_revenue = revenue_data.aggregate(total=Sum("amount"))["total"] or 0
    recent_revenue = revenue_data.filter(
        created_at__gte=week_ago
    ).aggregate(total=Sum("amount"))["total"] or 0
    total_sales = revenue_data.count()

    # Recent activity
    course_ids = list(courses.values_list("id", flat=True))
    recent_activity = ActivityLog.objects.filter(
        Q(user=user)
        | Q(metadata__course_id__in=[str(cid) for cid in course_ids])
    )[:10]
    activity_data = ActivityLogSerializer(recent_activity, many=True, context={"request": request}).data

    return Response({
        "courses": {
            "total": total_courses,
            "published": published_courses,
            "draft": draft_courses,
        },
        "enrollments": {
            "total": total_enrollments,
            "active": active_enrollments,
            "completed": completed_enrollments,
            "recent_week": recent_enrollments,
            "completion_rate": round(completion_rate, 1),
        },
        "course_breakdown": course_breakdown,
        "revenue": {
            "total": float(total_revenue),
            "recent_week": float(recent_revenue),
            "total_sales": total_sales,
        },
        "recent_activity": activity_data,
    })


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def admin_dashboard(request):
    """Platform-wide analytics for admins."""
    today = timezone.now()
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)

    if request.user.role != "admin":
        return Response(
            {"detail": "Admin access required."},
            status=status.HTTP_403_FORBIDDEN,
        )

    # User stats
    users = User.objects.all()
    total_users = users.count()
    users_by_role = dict(
        users.values("role").annotate(count=Count("id")).values_list("role", "count")
    )
    new_users_week = users.filter(date_joined__gte=week_ago).count()
    new_users_month = users.filter(date_joined__gte=month_ago).count()

    # Course stats
    courses = Course.objects.all()
    total_courses = courses.count()
    courses_by_status = dict(
        courses.values("status").annotate(count=Count("id")).values_list("status", "count")
    )
    courses_by_category_raw = (
        courses.filter(category__isnull=False)
        .values("category__name")
        .annotate(count=Count("id"))
        .values_list("category__name", "count")
    )
    courses_by_category = dict(courses_by_category_raw)

    # Enrollment stats
    enrollments = Enrollment.objects.all()
    total_enrollments = enrollments.count()
    active_enrollments = enrollments.filter(status=Enrollment.Status.ACTIVE).count()
    completed_enrollments = enrollments.filter(status=Enrollment.Status.COMPLETED).count()
    enrollments_week = enrollments.filter(enrolled_at__gte=week_ago).count()
    enrollments_month = enrollments.filter(enrolled_at__gte=month_ago).count()

    # Revenue stats
    completed_orders = Order.objects.filter(status=Order.Status.COMPLETED)
    total_revenue = completed_orders.aggregate(total=Sum("amount"))["total"] or 0
    revenue_week = completed_orders.filter(
        created_at__gte=week_ago
    ).aggregate(total=Sum("amount"))["total"] or 0
    revenue_month = completed_orders.filter(
        created_at__gte=month_ago
    ).aggregate(total=Sum("amount"))["total"] or 0
    total_orders = completed_orders.count()

    # Quiz & Assignment stats
    total_quiz_attempts = Attempt.objects.filter(
        status=Attempt.Status.SUBMITTED
    ).count()
    avg_quiz_score = Attempt.objects.filter(
        status=Attempt.Status.SUBMITTED
    ).aggregate(avg=Avg("score"))["avg"] or 0

    total_submissions = Submission.objects.filter(
        status=Submission.Status.GRADED
    ).count()
    avg_grade = Grade.objects.aggregate(avg=Avg("points_earned"))["avg"] or 0

    # Certificate stats
    certificates_issued = Certificate.objects.filter(is_revoked=False).count()
    certificates_week = Certificate.objects.filter(
        issued_at__gte=week_ago, is_revoked=False
    ).count()

    # Activity stats
    total_activities = ActivityLog.objects.count()
    activities_week = ActivityLog.objects.filter(created_at__gte=week_ago).count()
    activities_month = ActivityLog.objects.filter(created_at__gte=month_ago).count()

    # Most active action types
    top_actions = dict(
        ActivityLog.objects.values("action_type")
        .annotate(count=Count("id"))
        .order_by("-count")[:10]
        .values_list("action_type", "count")
    )

    # Recent platform activity
    recent_activity = ActivityLog.objects.all()[:20]
    activity_data = ActivityLogSerializer(recent_activity, many=True, context={"request": request}).data

    return Response({
        "users": {
            "total": total_users,
            "by_role": users_by_role,
            "new_week": new_users_week,
            "new_month": new_users_month,
        },
        "courses": {
            "total": total_courses,
            "by_status": courses_by_status,
            "by_category": courses_by_category,
        },
        "enrollments": {
            "total": total_enrollments,
            "active": active_enrollments,
            "completed": completed_enrollments,
            "new_week": enrollments_week,
            "new_month": enrollments_month,
        },
        "revenue": {
            "total": float(total_revenue),
            "week": float(revenue_week),
            "month": float(revenue_month),
            "total_orders": total_orders,
        },
        "assessments": {
            "total_quiz_attempts": total_quiz_attempts,
            "avg_quiz_score": round(float(avg_quiz_score), 1),
            "total_graded_submissions": total_submissions,
            "avg_grade": round(float(avg_grade), 1),
        },
        "certificates": {
            "total_issued": certificates_issued,
            "issued_week": certificates_week,
        },
        "activity": {
            "total": total_activities,
            "week": activities_week,
            "month": activities_month,
            "top_actions": top_actions,
        },
        "recent_activity": activity_data,
    })
