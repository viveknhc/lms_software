from django.db import models


class Section(models.Model):
    course = models.ForeignKey(
        "courses.Course",
        on_delete=models.CASCADE,
        related_name="learning_sections",
        verbose_name="Course",
    )
    title = models.CharField(max_length=300, verbose_name="Title")
    order = models.PositiveIntegerField(default=0, verbose_name="Order")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")

    class Meta:
        db_table = "learning_sections"
        verbose_name = "Learning Section"
        verbose_name_plural = "Learning Sections"
        ordering = ["order"]

    def __str__(self):
        return f"{self.course.title} - {self.title}"


class Lesson(models.Model):
    class ContentType(models.TextChoices):
        VIDEO = "video", "Video"
        DOCUMENT = "document", "Document"
        TEXT = "text", "Text"
        QUIZ = "quiz", "Quiz"

    section = models.ForeignKey(
        Section,
        on_delete=models.CASCADE,
        related_name="lessons",
        verbose_name="Section",
    )
    course = models.ForeignKey(
        "courses.Course",
        on_delete=models.CASCADE,
        related_name="lessons",
        verbose_name="Course",
    )
    title = models.CharField(max_length=300, verbose_name="Title")
    content_type = models.CharField(
        max_length=20,
        choices=ContentType.choices,
        default=ContentType.TEXT,
        verbose_name="Content Type",
    )
    video_url = models.URLField(blank=True, verbose_name="Video URL")
    content = models.TextField(blank=True, verbose_name="Content")
    duration_minutes = models.PositiveIntegerField(
        default=0, verbose_name="Duration (minutes)"
    )
    order = models.PositiveIntegerField(default=0, verbose_name="Order")
    is_free = models.BooleanField(default=False, verbose_name="Is Free Preview")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated At")

    class Meta:
        db_table = "lessons"
        verbose_name = "Lesson"
        verbose_name_plural = "Lessons"
        ordering = ["order"]

    def save(self, *args, **kwargs):
        # Auto-populate course from the parent section to avoid inconsistencies
        if self.section_id and not self.course_id:
            self.course = self.section.course
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
