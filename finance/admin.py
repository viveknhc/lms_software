from django.contrib import admin

from finance.models import InstructorSalary, StudentFee


@admin.register(StudentFee)
class StudentFeeAdmin(admin.ModelAdmin):
    list_display = ["student", "course", "total_fee", "paid_amount", "due_amount", "status", "due_date"]
    list_filter = ["status", "course"]
    search_fields = ["student__username", "student__first_name", "student__last_name"]


@admin.register(InstructorSalary)
class InstructorSalaryAdmin(admin.ModelAdmin):
    list_display = ["instructor", "net_salary", "month", "year", "payment_status"]
    list_filter = ["payment_status", "month", "year"]
    search_fields = ["instructor__username", "instructor__first_name", "instructor__last_name"]
