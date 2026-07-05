from django.db import models


class NotificationTemplate(models.Model):
    class NotificationType(models.TextChoices):
        IN_APP = "in_app", "In-App"
        EMAIL = "email", "Email"
        BOTH = "both", "Both"

    name = models.CharField(
        max_length=100,
        unique=True,
        verbose_name="Template Name",
        help_text="Unique identifier, e.g. 'enrollment_confirmation'",
    )
    subject = models.CharField(max_length=300, verbose_name="Subject")
    body = models.TextField(verbose_name="Body Template", help_text="Use {{variable}} placeholders")
    notification_type = models.CharField(
        max_length=20,
        choices=NotificationType.choices,
        default=NotificationType.IN_APP,
        verbose_name="Notification Type",
    )
    is_active = models.BooleanField(default=True, verbose_name="Is Active")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated At")

    class Meta:
        db_table = "notification_templates"
        verbose_name = "Notification Template"
        verbose_name_plural = "Notification Templates"

    def __str__(self):
        return self.name


class Notification(models.Model):
    class NotificationType(models.TextChoices):
        IN_APP = "in_app", "In-App"
        EMAIL = "email", "Email"
        PUSH = "push", "Push"
        SMS = "sms", "SMS"

    recipient = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="notifications",
        verbose_name="Recipient",
    )
    title = models.CharField(max_length=300, verbose_name="Title")
    message = models.TextField(verbose_name="Message")
    notification_type = models.CharField(
        max_length=20,
        choices=NotificationType.choices,
        default=NotificationType.IN_APP,
        verbose_name="Notification Type",
    )
    link = models.URLField(blank=True, verbose_name="Link", help_text="Optional URL to navigate to")
    template = models.ForeignKey(
        NotificationTemplate,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="notifications",
        verbose_name="Template",
    )
    is_read = models.BooleanField(default=False, verbose_name="Is Read")
    read_at = models.DateTimeField(null=True, blank=True, verbose_name="Read At")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")

    class Meta:
        db_table = "notifications"
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.recipient.username} - {self.title[:50]}"
