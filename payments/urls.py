from django.urls import path
from rest_framework.routers import DefaultRouter

from payments.views import (
    CreateCheckoutSessionView,
    InvoiceViewSet,
    OrderViewSet,
    PaymentViewSet,
    payment_cancelled,
    payment_success,
    stripe_webhook,
)

router = DefaultRouter()
router.register(r"orders", OrderViewSet, basename="payment-order")
router.register(r"payments", PaymentViewSet, basename="payment-payment")
router.register(r"invoices", InvoiceViewSet, basename="payment-invoice")

urlpatterns = [
    path("checkout/", CreateCheckoutSessionView.as_view(), name="payment-checkout"),
    path("webhook/", stripe_webhook, name="payment-webhook"),
    path("success/", payment_success, name="payment-success"),
    path("cancelled/", payment_cancelled, name="payment-cancelled"),
] + router.urls
