import json
import os

import stripe
from django.conf import settings
from django.db import transaction
from django.utils.timezone import now
from django.views.decorators.csrf import csrf_exempt
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from courses.models import Course
from enrollments.models import Enrollment
from payments.models import Invoice, Order, Payment
from payments.serializers import (
    CreateCheckoutSessionSerializer,
    InvoiceSerializer,
    OrderSerializer,
    PaymentSerializer,
)

stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")


class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Order.objects.select_related("student", "course").all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["status", "course"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.role == "student":
            qs = qs.filter(student=user)
        elif user.role == "instructor":
            qs = qs.filter(course__instructor=user)
        return qs


class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Payment.objects.select_related("order__student", "order__course").all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["status", "order"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.role == "student":
            qs = qs.filter(order__student=user)
        elif user.role == "instructor":
            qs = qs.filter(order__course__instructor=user)
        return qs


class InvoiceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Invoice.objects.select_related("order__course", "student").all()
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["is_paid"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.role == "student":
            qs = qs.filter(student=user)
        elif user.role == "instructor":
            qs = qs.filter(order__course__instructor=user)
        return qs


class CreateCheckoutSessionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CreateCheckoutSessionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        course = Course.objects.get(id=serializer.validated_data["course_id"])
        user = request.user

        # Check if already enrolled
        if Enrollment.objects.filter(student=user, course=course, status=Enrollment.Status.ACTIVE).exists():
            return Response(
                {"detail": "You are already enrolled in this course."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if there's a pending order
        existing_order = Order.objects.filter(
            student=user, course=course, status=Order.Status.PENDING
        ).first()
        if existing_order and existing_order.stripe_session_id:
            return Response(
                {
                    "session_id": existing_order.stripe_session_id,
                    "order_id": existing_order.id,
                },
                status=status.HTTP_200_OK,
            )

        # Cancel any old pending orders
        Order.objects.filter(
            student=user, course=course, status=Order.Status.PENDING
        ).update(status=Order.Status.CANCELLED)

        # Create Stripe checkout session
        try:
            session = stripe.checkout.Session.create(
                mode="payment",
                customer_email=user.email,
                client_reference_id=str(user.id),
                line_items=[
                    {
                        "price_data": {
                                            "currency": getattr(settings, "DEFAULT_CURRENCY", "usd"),
                            "product_data": {
                                "name": course.title,
                                "description": course.short_description or course.description[:200],
                            },
                            "unit_amount": int(course.price * 100),  # Stripe uses cents
                        },
                        "quantity": 1,
                    }
                ],
                metadata={
                    "course_id": str(course.id),
                    "user_id": str(user.id),
                },
                success_url=request.build_absolute_uri("/api/payments/success/")
                + "?session_id={CHECKOUT_SESSION_ID}",
                cancel_url=request.build_absolute_uri("/api/payments/cancelled/"),
            )
        except stripe.error.StripeError as e:
            return Response(
                {"detail": f"Payment service error: {str(e)}"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        # Create order
        order = Order.objects.create(
            student=user,
            course=course,
            amount=course.price,
            currency=getattr(settings, "DEFAULT_CURRENCY", "usd"),
            stripe_session_id=session.id,
            status=Order.Status.PENDING,
        )

        return Response(
            {
                "session_id": session.id,
                "session_url": session.url,
                "order_id": order.id,
            },
            status=status.HTTP_201_CREATED,
        )


@csrf_exempt
@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def stripe_webhook(request):
    """Handle Stripe webhook events."""
    payload = request.body
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE", "")
    endpoint_secret = os.getenv("STRIPE_WEBHOOK_SECRET", "")

    try:
        if endpoint_secret:
            event = stripe.Webhook.construct_event(
                payload, sig_header, endpoint_secret
            )
        else:
            # Development mode — parse raw JSON without signature verification
            event = stripe.Event.construct_from(json.loads(payload), stripe.api_key)
    except stripe.error.SignatureVerificationError:
        return Response(
            {"detail": "Invalid signature."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    except json.JSONDecodeError:
        return Response(
            {"detail": "Invalid payload."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    handler = WEBHOOK_HANDLERS.get(event["type"])
    if handler:
        handler(event)

    return Response({"status": "received"})


def handle_checkout_completed(event):
    """Handle checkout.session.completed event."""
    session = event["data"]["object"]
    session_id = session.get("id")

    try:
        order = Order.objects.get(stripe_session_id=session_id, status=Order.Status.PENDING)
    except Order.DoesNotExist:
        return

    with transaction.atomic():
        payment_intent_id = session.get("payment_intent")

        # Update order
        order.status = Order.Status.COMPLETED
        order.save()

        # Create payment record
        payment = Payment.objects.create(
            order=order,
            stripe_payment_intent_id=payment_intent_id,
            amount=order.amount,
            currency=session.get("currency", getattr(settings, "DEFAULT_CURRENCY", "usd")).upper(),
            status=Payment.Status.SUCCEEDED,
            receipt_url=session.get("receipt_url", ""),
            paid_at=now(),
        )

        # Create invoice
        Invoice.objects.create(
            order=order,
            student=order.student,
            amount=order.amount,
            currency=session.get("currency", getattr(settings, "DEFAULT_CURRENCY", "usd")).upper(),
            is_paid=True,
        )

        # Create enrollment
        Enrollment.objects.get_or_create(
            student=order.student,
            course=order.course,
            defaults={"status": Enrollment.Status.ACTIVE},
        )


def handle_payment_failed(event):
    """Handle checkout.session.async_payment_failed event."""
    session = event["data"]["object"]
    session_id = session.get("id")

    try:
        order = Order.objects.get(stripe_session_id=session_id, status=Order.Status.PENDING)
    except Order.DoesNotExist:
        return

    order.status = Order.Status.FAILED
    order.save()


WEBHOOK_HANDLERS = {
    "checkout.session.completed": handle_checkout_completed,
    "checkout.session.async_payment_failed": handle_payment_failed,
}


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def payment_success(request):
    """Redirect page shown after successful payment."""
    session_id = request.query_params.get("session_id")
    if session_id:
        try:
            order = Order.objects.get(stripe_session_id=session_id, status=Order.Status.COMPLETED)
            return Response(
                {
                    "status": "success",
                    "message": f"Payment successful! You are now enrolled in '{order.course.title}'.",
                    "course_slug": order.course.slug,
                }
            )
        except Order.DoesNotExist:
            pass
    return Response(
        {"status": "pending", "message": "Payment is being processed. Please check your enrollments shortly."}
    )


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def payment_cancelled(request):
    """Redirect page shown after cancelled payment."""
    return Response(
        {"status": "cancelled", "message": "Payment was cancelled. No charges were made."}
    )
