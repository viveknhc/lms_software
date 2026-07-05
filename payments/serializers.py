from rest_framework import serializers

from payments.models import Invoice, Order, Payment


class OrderSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField(read_only=True)
    course_title = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "student",
            "student_name",
            "course",
            "course_title",
            "amount",
            "currency",
            "status",
            "stripe_session_id",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "student", "status", "stripe_session_id", "created_at", "updated_at"]

    def get_student_name(self, obj):
        return str(obj.student)

    def get_course_title(self, obj):
        return obj.course.title if obj.course else None


class PaymentSerializer(serializers.ModelSerializer):
    order_id = serializers.IntegerField(source="order.id", read_only=True)

    class Meta:
        model = Payment
        fields = [
            "id",
            "order",
            "order_id",
            "stripe_payment_intent_id",
            "amount",
            "currency",
            "status",
            "stripe_charge_id",
            "receipt_url",
            "paid_at",
            "created_at",
        ]
        read_only_fields = ["id", "paid_at", "created_at"]


class InvoiceSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField(read_only=True)
    course_title = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Invoice
        fields = [
            "id",
            "order",
            "student",
            "student_name",
            "course_title",
            "invoice_number",
            "amount",
            "currency",
            "stripe_invoice_url",
            "stripe_invoice_pdf",
            "is_paid",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def get_student_name(self, obj):
        return str(obj.student)

    def get_course_title(self, obj):
        return obj.order.course.title if obj.order else None


class CreateCheckoutSessionSerializer(serializers.Serializer):
    course_id = serializers.IntegerField()

    def validate_course_id(self, value):
        from courses.models import Course

        try:
            course = Course.objects.get(id=value, status=Course.Status.PUBLISHED)
        except Course.DoesNotExist:
            raise serializers.ValidationError("Course not found or not published.")

        if course.price <= 0:
            raise serializers.ValidationError("This course is free. No payment required.")

        return value
