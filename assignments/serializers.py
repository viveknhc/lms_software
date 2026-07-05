from rest_framework import serializers

from assignments.models import Assignment, Grade, Submission


class GradeSerializer(serializers.ModelSerializer):
    grader_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Grade
        fields = [
            "id",
            "submission",
            "graded_by",
            "grader_name",
            "points_earned",
            "feedback",
            "is_passed",
            "graded_at",
        ]
        read_only_fields = ["id", "graded_by", "graded_at"]

    def get_grader_name(self, obj):
        return str(obj.graded_by) if obj.graded_by else None


class SubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField(read_only=True)
    assignment_title = serializers.SerializerMethodField(read_only=True)
    grade = GradeSerializer(read_only=True)

    class Meta:
        model = Submission
        fields = [
            "id",
            "assignment",
            "assignment_title",
            "student",
            "student_name",
            "content",
            "attachment",
            "status",
            "submitted_at",
            "updated_at",
            "grade",
        ]
        read_only_fields = ["id", "student", "status", "submitted_at", "updated_at"]

    def get_student_name(self, obj):
        return str(obj.student)

    def get_assignment_title(self, obj):
        return obj.assignment.title if obj.assignment else None


class SubmissionSubmitSerializer(serializers.Serializer):
    """Used for submitting an assignment - content and/or attachment."""
    content = serializers.CharField(required=False, allow_blank=True)
    attachment = serializers.FileField(required=False, allow_null=True)


class AssignmentSerializer(serializers.ModelSerializer):
    course_title = serializers.SerializerMethodField(read_only=True)
    submission_count = serializers.SerializerMethodField(read_only=True)
    graded_count = serializers.SerializerMethodField(read_only=True)
    my_submission = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Assignment
        fields = [
            "id",
            "course",
            "course_title",
            "section",
            "title",
            "description",
            "instructions",
            "total_points",
            "due_date",
            "attachment",
            "is_published",
            "submission_count",
            "graded_count",
            "my_submission",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_course_title(self, obj):
        return obj.course.title if obj.course else None

    def get_submission_count(self, obj):
        return obj.submissions.count()

    def get_graded_count(self, obj):
        return obj.submissions.filter(status=Submission.Status.GRADED).count()

    def get_my_submission(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            try:
                submission = obj.submissions.get(student=request.user)
                return SubmissionSerializer(submission, context=self.context).data
            except Submission.DoesNotExist:
                return None
        return None
