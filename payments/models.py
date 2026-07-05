import uuid

from django.db import models


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"
        REFUNDED = "refunded", "Refunded"
        CANCELLED = "cancelled", "Cancelled"

    student = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="orders",
        verbose_name="Student",
    )
    course = models.ForeignKey(
        "courses.Course",
        on_delete=models.CASCADE,
        related_name="orders",
        verbose_name="Course",
    )
    amount = models.DecimalField(
        max_digits=10, decimal_places=2, verbose_name="Amount"
    )
    currency = models.CharField(max_length=3, default="usd", verbose_name="Currency")
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        verbose_name="Status",
    )
    stripe_session_id = models.CharField(
        max_length=255, blank=True, verbose_name="Stripe Session ID"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated At")

    class Meta:
        db_table = "orders"
        verbose_name = "Order"
        verbose_name_plural = "Orders"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.student.username} - {self.course.title} ({self.get_status_display()})"


class Payment(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        SUCCEEDED = "succeeded", "Succeeded"
        FAILED = "failed", "Failed"
        REFUNDED = "refunded", "Refunded"

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="payments",
        verbose_name="Order",
    )
    stripe_payment_intent_id = models.CharField(
        max_length=255, unique=True, verbose_name="Stripe Payment Intent ID"
    )
    amount = models.DecimalField(
        max_digits=10, decimal_places=2, verbose_name="Amount"
    )
    currency = models.CharField(max_length=3, default="usd", verbose_name="Currency")
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        verbose_name="Status",
    )
    stripe_charge_id = models.CharField(
        max_length=255, blank=True, verbose_name="Stripe Charge ID"
    )
    receipt_url = models.URLField(blank=True, verbose_name="Receipt URL")
    paid_at = models.DateTimeField(null=True, blank=True, verbose_name="Paid At")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")

    class Meta:
        db_table = "payments"
        verbose_name = "Payment"
        verbose_name_plural = "Payments"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Payment {self.stripe_payment_intent_id} - {self.get_status_display()}"


class Invoice(models.Model):
    order = models.OneToOneField(
        Order,
        on_delete=models.CASCADE,
        related_name="invoice",
        verbose_name="Order",
    )
    student = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="invoices",
        verbose_name="Student",
    )
    invoice_number = models.CharField(
        max_length=50, unique=True, verbose_name="Invoice Number"
    )
    amount = models.DecimalField(
        max_digits=10, decimal_places=2, verbose_name="Amount"
    )
    currency = models.CharField(max_length=3, default="usd", verbose_name="Currency")
    stripe_invoice_url = models.URLField(blank=True, verbose_name="Stripe Invoice URL")
    stripe_invoice_pdf = models.URLField(blank=True, verbose_name="Stripe Invoice PDF")
    is_paid = models.BooleanField(default=False, verbose_name="Is Paid")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")

    class Meta:
        db_table = "invoices"
        verbose_name = "Invoice"
        verbose_name_plural = "Invoices"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Invoice {self.invoice_number} - {self.student.username}"

    def save(self, *args, **kwargs):
        if not self.invoice_number:
            self.invoice_number = f"INV-{uuid.uuid4().hex[:12].upper()}"
        super().save(*args, **kwargs)
