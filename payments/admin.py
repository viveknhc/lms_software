from django.contrib import admin

from payments.models import Invoice, Order, Payment


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ["id", "student", "course", "amount", "currency", "status", "created_at"]
    list_filter = ["status", "currency"]
    search_fields = ["student__username", "student__email", "course__title", "stripe_session_id"]
    readonly_fields = ["stripe_session_id", "created_at", "updated_at"]


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ["id", "order", "amount", "currency", "status", "paid_at"]
    list_filter = ["status"]
    search_fields = ["stripe_payment_intent_id", "stripe_charge_id"]
    readonly_fields = ["created_at", "paid_at"]


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ["invoice_number", "student", "amount", "is_paid", "created_at"]
    list_filter = ["is_paid"]
    search_fields = ["invoice_number", "student__username", "student__email"]
    readonly_fields = ["created_at"]
