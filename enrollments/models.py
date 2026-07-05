from django.db import models


class Enrollment(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        COMPLETED = "completed", "Completed"
        DROPPED = "dropped", "Dropped"

    student = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="enrollments",
        verbose_name="Student",
    )
    course = models.ForeignKey(
        "courses.Course",
        on_delete=models.CASCADE,
        related_name="enrollments",
        verbose_name="Course",
    )
    enrolled_at = models.DateTimeField(auto_now_add=True, verbose_name="Enrolled At")
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
        verbose_name="Status",
    )

    class Meta:
        db_table = "enrollments"
        verbose_name = "Enrollment"
        verbose_name_plural = "Enrollments"
        unique_together = ("student", "course")

    def __str__(self):
        return f"{self.student.username} → {self.course} ({self.get_status_display()})"


class CourseProgress(models.Model):
    student = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="course_progress",
        verbose_name="Student",
    )
    course = models.ForeignKey(
        "courses.Course",
        on_delete=models.CASCADE,
        related_name="course_progress",
        verbose_name="Course",
    )
    enrollment = models.OneToOneField(
        Enrollment,
        on_delete=models.CASCADE,
        related_name="progress",
        verbose_name="Enrollment",
    )
    completion_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.00,
        verbose_name="Completion %",
    )
    is_completed = models.BooleanField(default=False, verbose_name="Is Completed")
    last_accessed = models.DateTimeField(
        auto_now=True, verbose_name="Last Accessed"
    )

    class Meta:
        db_table = "course_progress"
        verbose_name = "Course Progress"
        verbose_name_plural = "Course Progresses"
        unique_together = ("student", "course")

    def __str__(self):
        return f"{self.student.username} - {self.course}: {self.completion_percentage}%"


class LessonProgress(models.Model):
    student = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="lesson_progress",
        verbose_name="Student",
    )
    lesson = models.ForeignKey(
        "learning.Lesson",
        on_delete=models.CASCADE,
        related_name="lesson_progress",
        verbose_name="Lesson",
    )
    course = models.ForeignKey(
        "courses.Course",
        on_delete=models.CASCADE,
        related_name="lesson_progress",
        verbose_name="Course",
    )
    enrollment = models.ForeignKey(
        Enrollment,
        on_delete=models.CASCADE,
        related_name="lesson_progress",
        verbose_name="Enrollment",
    )
    is_completed = models.BooleanField(default=False, verbose_name="Is Completed")
    time_spent_minutes = models.PositiveIntegerField(
        default=0, verbose_name="Time Spent (minutes)"
    )
    completed_at = models.DateTimeField(
        blank=True, null=True, verbose_name="Completed At"
    )

    class Meta:
        db_table = "lesson_progress"
        verbose_name = "Lesson Progress"
        verbose_name_plural = "Lesson Progresses"
        unique_together = ("student", "lesson")

    def __str__(self):
        return f"{self.student.username} - Lesson {self.lesson_id}: {'✅' if self.is_completed else '⏳'}"
