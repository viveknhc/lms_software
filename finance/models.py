from decimal import Decimal

from django.db import models
from django.core.validators import MinValueValidator


class StudentFee(models.Model):
    class FeeStatus(models.TextChoices):
        PAID = "paid", "Paid"
        PARTIAL = "partial", "Partial"
        UNPAID = "unpaid", "Unpaid"
        OVERDUE = "overdue", "Overdue"

    student = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="fees",
        verbose_name="Student",
        limit_choices_to={"role": "student"},
    )
    course = models.ForeignKey(
        "courses.Course",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="student_fees",
        verbose_name="Course",
    )
    total_fee = models.DecimalField(
        max_digits=10, decimal_places=2, verbose_name="Course Fee",
        validators=[MinValueValidator(0)],
    )
    paid_amount = models.DecimalField(
        max_digits=10, decimal_places=2, default=0, verbose_name="Paid Amount",
        validators=[MinValueValidator(0)],
    )
    due_date = models.DateField(verbose_name="Due Date")
    paid_date = models.DateField(null=True, blank=True, verbose_name="Paid Date")
    status = models.CharField(
        max_length=20,
        choices=FeeStatus.choices,
        default=FeeStatus.UNPAID,
        verbose_name="Fee Status",
    )
    notes = models.TextField(blank=True, verbose_name="Notes")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated At")

    class Meta:
        db_table = "student_fees"
        verbose_name = "Student Fee"
        verbose_name_plural = "Student Fees"
        ordering = ["-created_at"]

    @property
    def due_amount(self):
        return max(self.total_fee - self.paid_amount, 0)

    def __str__(self):
        return f"{self.student.username} - ${self.total_fee} ({self.get_status_display()})"


class InstructorSalary(models.Model):
    class PaymentStatus(models.TextChoices):
        PAID = "paid", "Paid"
        PENDING = "pending", "Pending"
        CANCELLED = "cancelled", "Cancelled"

    instructor = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="salaries",
        verbose_name="Instructor",
        limit_choices_to={"role": "instructor"},
    )
    commission_percentage = models.DecimalField(
        max_digits=5, decimal_places=2, default=70.00,
        verbose_name="Commission (%)",
        help_text="Percentage of course revenue paid to instructor",
        validators=[MinValueValidator(0)],
    )
    total_revenue = models.DecimalField(
        max_digits=12, decimal_places=2, default=0,
        verbose_name="Total Course Revenue",
        help_text="Total fees collected from students for this instructor's courses",
        validators=[MinValueValidator(0)],
    )
    bonus = models.DecimalField(
        max_digits=10, decimal_places=2, default=0, verbose_name="Bonus",
        validators=[MinValueValidator(0)],
    )
    deductions = models.DecimalField(
        max_digits=10, decimal_places=2, default=0, verbose_name="Deductions",
        validators=[MinValueValidator(0)],
    )
    month = models.PositiveSmallIntegerField(verbose_name="Month")
    year = models.PositiveSmallIntegerField(verbose_name="Year")
    payment_status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING,
        verbose_name="Payment Status",
    )
    payment_date = models.DateField(null=True, blank=True, verbose_name="Payment Date")
    notes = models.TextField(blank=True, verbose_name="Notes")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated At")

    class Meta:
        db_table = "instructor_salaries"
        verbose_name = "Instructor Salary"
        verbose_name_plural = "Instructor Salaries"
        ordering = ["-year", "-month"]
        unique_together = ("instructor", "month", "year")

    @property
    def net_salary(self):
        commission = self.total_revenue * self.commission_percentage / Decimal("100")
        return max(commission + self.bonus - self.deductions, 0)

    def __str__(self):
        return f"{self.instructor.username} - {self.month}/{self.year} - ${self.net_salary}"
