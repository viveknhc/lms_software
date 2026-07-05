from rest_framework import serializers

from assessments.models import Attempt, Option, Question, Quiz, Result
from courses.serializers import CourseSerializer


class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ["id", "question", "text", "is_correct", "order"]
        read_only_fields = ["id"]

    def to_representation(self, instance):
        """Expose is_correct only for quiz owners (instructors/admins)."""
        data = super().to_representation(instance)
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            role = getattr(request.user, "role", None)
            if role not in ("instructor", "admin"):
                data.pop("is_correct", None)
        else:
            data.pop("is_correct", None)
        return data


class QuestionSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True, read_only=True)
    quiz_title = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Question
        fields = [
            "id",
            "quiz",
            "quiz_title",
            "text",
            "question_type",
            "order",
            "points",
            "options",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def get_quiz_title(self, obj):
        return obj.quiz.title if obj.quiz else None


class QuestionDetailSerializer(serializers.ModelSerializer):
    """Used for quiz detail view - includes options inline."""
    options = OptionSerializer(many=True)

    class Meta:
        model = Question
        fields = [
            "id",
            "text",
            "question_type",
            "order",
            "points",
            "options",
        ]
        read_only_fields = ["id"]


class QuizListSerializer(serializers.ModelSerializer):
    course_title = serializers.SerializerMethodField(read_only=True)
    question_count = serializers.SerializerMethodField(read_only=True)
    total_points = serializers.IntegerField(read_only=True)

    class Meta:
        model = Quiz
        fields = [
            "id",
            "course",
            "course_title",
            "title",
            "description",
            "time_limit_minutes",
            "passing_score",
            "max_attempts",
            "is_published",
            "question_count",
            "total_points",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_course_title(self, obj):
        return obj.course.title if obj.course else None

    def get_question_count(self, obj):
        return obj.questions.count()


class QuizDetailSerializer(serializers.ModelSerializer):
    """Includes questions with options for taking the quiz."""
    questions = QuestionDetailSerializer(many=True, read_only=True)
    course_title = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Quiz
        fields = [
            "id",
            "course",
            "course_title",
            "title",
            "description",
            "time_limit_minutes",
            "passing_score",
            "max_attempts",
            "is_published",
            "questions",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_course_title(self, obj):
        return obj.course.title if obj.course else None


class ResultSerializer(serializers.ModelSerializer):
    question_text = serializers.SerializerMethodField(read_only=True)
    question_type = serializers.SerializerMethodField(read_only=True)
    selected_option_ids = serializers.SerializerMethodField(read_only=True)
    correct_option_ids = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Result
        fields = [
            "id",
            "question",
            "question_text",
            "question_type",
            "selected_option_ids",
            "correct_option_ids",
            "is_correct",
            "points_earned",
        ]
        read_only_fields = ["id"]

    def get_question_text(self, obj):
        return obj.question.text if obj.question else None

    def get_question_type(self, obj):
        return obj.question.question_type if obj.question else None

    def get_selected_option_ids(self, obj):
        return list(obj.selected_options.values_list("id", flat=True))

    def get_correct_option_ids(self, obj):
        return list(
            obj.question.options.filter(is_correct=True).values_list("id", flat=True)
        )


class AttemptSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField(read_only=True)
    quiz_title = serializers.SerializerMethodField(read_only=True)
    results = ResultSerializer(many=True, read_only=True)

    class Meta:
        model = Attempt
        fields = [
            "id",
            "quiz",
            "quiz_title",
            "student",
            "student_name",
            "status",
            "score",
            "is_passed",
            "total_questions",
            "correct_answers",
            "time_taken_seconds",
            "started_at",
            "submitted_at",
            "results",
        ]
        read_only_fields = [
            "id",
            "student",
            "status",
            "score",
            "is_passed",
            "total_questions",
            "correct_answers",
            "time_taken_seconds",
            "started_at",
            "submitted_at",
        ]

    def get_student_name(self, obj):
        return str(obj.student)

    def get_quiz_title(self, obj):
        return obj.quiz.title if obj.quiz else None


class AttemptStartSerializer(serializers.Serializer):
    """Used for starting a new attempt - no input needed."""
    pass


class AnswerItemSerializer(serializers.Serializer):
    """A single answer for submission."""
    question_id = serializers.IntegerField()
    selected_option_ids = serializers.ListField(
        child=serializers.IntegerField(), allow_empty=True
    )


class AttemptSubmitSerializer(serializers.Serializer):
    """Submit an attempt with answers."""
    answers = AnswerItemSerializer(many=True)

    def validate_answers(self, value):
        if not value:
            raise serializers.ValidationError("At least one answer is required.")
        return value
