from django.db import models


class ActivityLog(models.Model):
    class ActionType(models.TextChoices):
        LOGIN = "login", "Login"
        REGISTER = "register", "Register"
        ENROLLMENT = "enrollment", "Course Enrollment"
        LESSON_COMPLETED = "lesson_completed", "Lesson Completed"
        COURSE_COMPLETED = "course_completed", "Course Completed"
        QUIZ_STARTED = "quiz_started", "Quiz Started"
        QUIZ_SUBMITTED = "quiz_submitted", "Quiz Submitted"
        ASSIGNMENT_SUBMITTED = "assignment_submitted", "Assignment Submitted"
        ASSIGNMENT_GRADED = "assignment_graded", "Assignment Graded"
        CERTIFICATE_ISSUED = "certificate_issued", "Certificate Issued"
        PAYMENT = "payment", "Payment Made"
        REVIEW = "review", "Review Submitted"

    user = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="activity_logs",
        verbose_name="User",
    )
    action_type = models.CharField(
        max_length=30,
        choices=ActionType.choices,
        verbose_name="Action Type",
    )
    description = models.CharField(max_length=500, verbose_name="Description")
    metadata = models.JSONField(
        default=dict, blank=True, verbose_name="Metadata",
        help_text="Additional context as JSON (e.g. course_id, quiz_id, etc.)",
    )
    ip_address = models.GenericIPAddressField(
        blank=True, null=True, verbose_name="IP Address"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")

    class Meta:
        db_table = "activity_logs"
        verbose_name = "Activity Log"
        verbose_name_plural = "Activity Logs"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "-created_at"]),
            models.Index(fields=["action_type"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.get_action_type_display()} - {self.created_at:%Y-%m-%d %H:%M}"
