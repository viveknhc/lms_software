from rest_framework import serializers
from django.utils import timezone

from finance.models import InstructorSalary, StudentFee


class StudentFeeSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField(read_only=True)
    course_title = serializers.SerializerMethodField(read_only=True)
    due_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = StudentFee
        fields = [
            "id",
            "student",
            "student_name",
            "course",
            "course_title",
            "total_fee",
            "paid_amount",
            "due_amount",
            "due_date",
            "paid_date",
            "status",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_student_name(self, obj):
        return str(obj.student)

    def get_course_title(self, obj):
        return obj.course.title if obj.course else None


class StudentFeeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentFee
        fields = [
            "student",
            "course",
            "total_fee",
            "paid_amount",
            "due_date",
            "notes",
        ]

    def validate_student(self, value):
        if value.role != "student":
            raise serializers.ValidationError("User must be a student")
        return value


class StudentFeeUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentFee
        fields = ["paid_amount", "status", "paid_date", "notes"]

    def validate(self, attrs):
        instance = self.instance
        if instance and attrs.get("paid_amount", instance.paid_amount) > instance.total_fee:
            raise serializers.ValidationError(
                {"paid_amount": "Paid amount cannot exceed total fee"}
            )
        return attrs


class InstructorSalarySerializer(serializers.ModelSerializer):
    instructor_name = serializers.SerializerMethodField(read_only=True)
    courses_taught = serializers.SerializerMethodField(read_only=True)
    net_salary = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = InstructorSalary
        fields = [
            "id",
            "instructor",
            "instructor_name",
            "courses_taught",
            "commission_percentage",
            "total_revenue",
            "bonus",
            "deductions",
            "net_salary",
            "month",
            "year",
            "payment_status",
            "payment_date",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_instructor_name(self, obj):
        return str(obj.instructor)

    def get_courses_taught(self, obj):
        return list(
            obj.instructor.courses.values_list("title", flat=True)
        )


class InstructorSalaryCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = InstructorSalary
        fields = [
            "instructor",
            "commission_percentage",
            "total_revenue",
            "bonus",
            "deductions",
            "month",
            "year",
            "notes",
        ]

    def validate_instructor(self, value):
        if value.role != "instructor":
            raise serializers.ValidationError("User must be an instructor")
        return value


class AccountsDashboardSerializer(serializers.Serializer):
    """Summary stats for the accounts dashboard."""

    total_collected_fees = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_pending_fees = serializers.DecimalField(max_digits=12, decimal_places=2)
    fee_collection_rate = serializers.FloatField()
    total_students_with_fees = serializers.IntegerField()
    students_with_outstanding = serializers.IntegerField()

    total_salary_paid = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_salary_pending = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_instructors_with_salary = serializers.IntegerField()
    instructors_with_pending = serializers.IntegerField()

    recent_fees = StudentFeeSerializer(many=True)
    recent_salaries = InstructorSalarySerializer(many=True)
