from django.core.validators import MinValueValidator
from django.db import models


class Quiz(models.Model):
    course = models.ForeignKey(
        "courses.Course",
        on_delete=models.CASCADE,
        related_name="quizzes",
        verbose_name="Course",
    )
    title = models.CharField(max_length=300, verbose_name="Title")
    description = models.TextField(blank=True, verbose_name="Description")
    time_limit_minutes = models.PositiveIntegerField(
        default=0,
        verbose_name="Time Limit (minutes)",
        help_text="0 means no time limit",
    )
    passing_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=50.00,
        validators=[MinValueValidator(0)],
        verbose_name="Passing Score (%)",
    )
    max_attempts = models.PositiveIntegerField(
        default=0,
        verbose_name="Max Attempts",
        help_text="0 means unlimited attempts",
    )
    is_published = models.BooleanField(default=False, verbose_name="Is Published")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated At")

    class Meta:
        db_table = "quizzes"
        verbose_name = "Quiz"
        verbose_name_plural = "Quizzes"
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

    @property
    def total_points(self):
        return self.questions.aggregate(total=models.Sum("points"))["total"] or 0


class Question(models.Model):
    class QuestionType(models.TextChoices):
        SINGLE_CHOICE = "single_choice", "Single Choice"
        MULTIPLE_CHOICE = "multiple_choice", "Multiple Choice"
        TRUE_FALSE = "true_false", "True/False"

    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name="questions",
        verbose_name="Quiz",
    )
    text = models.TextField(verbose_name="Question Text")
    question_type = models.CharField(
        max_length=20,
        choices=QuestionType.choices,
        default=QuestionType.SINGLE_CHOICE,
        verbose_name="Question Type",
    )
    order = models.PositiveIntegerField(default=0, verbose_name="Order")
    points = models.PositiveIntegerField(default=1, verbose_name="Points")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")

    class Meta:
        db_table = "questions"
        verbose_name = "Question"
        verbose_name_plural = "Questions"
        ordering = ["order"]

    def __str__(self):
        return f"{self.quiz.title} - Q{self.order}: {self.text[:60]}"


class Option(models.Model):
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name="options",
        verbose_name="Question",
    )
    text = models.CharField(max_length=500, verbose_name="Option Text")
    is_correct = models.BooleanField(default=False, verbose_name="Is Correct")
    order = models.PositiveIntegerField(default=0, verbose_name="Order")

    class Meta:
        db_table = "options"
        verbose_name = "Option"
        verbose_name_plural = "Options"
        ordering = ["order"]

    def __str__(self):
        prefix = "✓" if self.is_correct else " "
        return f"{prefix} {self.text[:50]}"


class Attempt(models.Model):
    class Status(models.TextChoices):
        IN_PROGRESS = "in_progress", "In Progress"
        SUBMITTED = "submitted", "Submitted"

    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name="attempts",
        verbose_name="Quiz",
    )
    student = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="quiz_attempts",
        verbose_name="Student",
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.IN_PROGRESS,
        verbose_name="Status",
    )
    score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="Score (%)",
    )
    is_passed = models.BooleanField(default=False, verbose_name="Is Passed")
    total_questions = models.PositiveIntegerField(default=0, verbose_name="Total Questions")
    correct_answers = models.PositiveIntegerField(default=0, verbose_name="Correct Answers")
    time_taken_seconds = models.PositiveIntegerField(
        default=0, verbose_name="Time Taken (seconds)"
    )
    started_at = models.DateTimeField(auto_now_add=True, verbose_name="Started At")
    submitted_at = models.DateTimeField(null=True, blank=True, verbose_name="Submitted At")

    class Meta:
        db_table = "attempts"
        verbose_name = "Attempt"
        verbose_name_plural = "Attempts"
        ordering = ["-started_at"]

    def __str__(self):
        return f"{self.student.username} - {self.quiz.title} ({self.get_status_display()})"


class Result(models.Model):
    attempt = models.ForeignKey(
        Attempt,
        on_delete=models.CASCADE,
        related_name="results",
        verbose_name="Attempt",
    )
    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name="results",
        verbose_name="Question",
    )
    selected_options = models.ManyToManyField(
        Option,
        blank=True,
        verbose_name="Selected Options",
    )
    is_correct = models.BooleanField(default=False, verbose_name="Is Correct")
    points_earned = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
        verbose_name="Points Earned",
    )

    class Meta:
        db_table = "results"
        verbose_name = "Result"
        verbose_name_plural = "Results"
        unique_together = ("attempt", "question")

    def __str__(self):
        return f"Q{self.question.order}: {'✓' if self.is_correct else '✗'}"
