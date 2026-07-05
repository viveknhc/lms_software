from django.db import models


class Assignment(models.Model):
    course = models.ForeignKey(
        "courses.Course",
        on_delete=models.CASCADE,
        related_name="assignments",
        verbose_name="Course",
    )
    section = models.ForeignKey(
        "learning.Section",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assignments",
        verbose_name="Section",
    )
    title = models.CharField(max_length=300, verbose_name="Title")
    description = models.TextField(blank=True, verbose_name="Description")
    instructions = models.TextField(blank=True, verbose_name="Instructions")
    total_points = models.PositiveIntegerField(default=100, verbose_name="Total Points")
    due_date = models.DateTimeField(null=True, blank=True, verbose_name="Due Date")
    attachment = models.FileField(
        upload_to="assignment_files/",
        blank=True,
        null=True,
        verbose_name="Attachment",
    )
    is_published = models.BooleanField(default=False, verbose_name="Is Published")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated At")

    class Meta:
        db_table = "assignments"
        verbose_name = "Assignment"
        verbose_name_plural = "Assignments"
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class Submission(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        SUBMITTED = "submitted", "Submitted"
        LATE = "late", "Late"
        GRADED = "graded", "Graded"

    assignment = models.ForeignKey(
        Assignment,
        on_delete=models.CASCADE,
        related_name="submissions",
        verbose_name="Assignment",
    )
    student = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="assignment_submissions",
        verbose_name="Student",
    )
    content = models.TextField(blank=True, verbose_name="Submission Content")
    attachment = models.FileField(
        upload_to="submission_files/",
        blank=True,
        null=True,
        verbose_name="Attachment",
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
        verbose_name="Status",
    )
    submitted_at = models.DateTimeField(
        auto_now_add=True, verbose_name="Submitted At"
    )
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated At")

    class Meta:
        db_table = "submissions"
        verbose_name = "Submission"
        verbose_name_plural = "Submissions"
        ordering = ["-submitted_at"]
        unique_together = ("assignment", "student")

    def __str__(self):
        return f"{self.student.username} - {self.assignment.title}"


class Grade(models.Model):
    submission = models.OneToOneField(
        Submission,
        on_delete=models.CASCADE,
        related_name="grade",
        verbose_name="Submission",
    )
    graded_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        related_name="given_grades",
        verbose_name="Graded By",
    )
    points_earned = models.DecimalField(
        max_digits=7,
        decimal_places=2,
        verbose_name="Points Earned",
    )
    feedback = models.TextField(blank=True, verbose_name="Feedback")
    is_passed = models.BooleanField(default=False, verbose_name="Is Passed")
    graded_at = models.DateTimeField(auto_now_add=True, verbose_name="Graded At")

    class Meta:
        db_table = "grades"
        verbose_name = "Grade"
        verbose_name_plural = "Grades"

    def __str__(self):
        return f"{self.submission.student.username} - {self.points_earned}/{self.submission.assignment.total_points}"
