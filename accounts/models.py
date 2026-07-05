from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        STUDENT = "student", "Student"
        INSTRUCTOR = "instructor", "Instructor"
        ADMIN = "admin", "Admin"

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.STUDENT,
        verbose_name="User Role",
    )
    bio = models.TextField(blank=True, verbose_name="Biography")
    profile_picture = models.ImageField(
        upload_to="profiles/", blank=True, null=True, verbose_name="Profile Picture"
    )
    phone = models.CharField(max_length=20, blank=True, verbose_name="Phone Number")
    date_of_birth = models.DateField(blank=True, null=True, verbose_name="Date of Birth")
    email_verified = models.BooleanField(default=False, verbose_name="Email Verified")

    class Meta:
        db_table = "users"
        verbose_name = "User"
        verbose_name_plural = "Users"

    def save(self, *args, **kwargs):
        if self.is_superuser and self.role != self.Role.ADMIN:
            self.role = self.Role.ADMIN
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.get_role_display()})"
