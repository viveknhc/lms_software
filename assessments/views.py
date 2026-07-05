from django.db import models
from django.db import transaction
from django.utils.timezone import now
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response

from assessments.models import Attempt, Option, Question, Quiz, Result
from assessments.serializers import (
    AttemptSerializer,
    AttemptSubmitSerializer,
    OptionSerializer,
    QuestionSerializer,
    QuizDetailSerializer,
    QuizListSerializer,
    ResultSerializer,
)
from enrollments.models import Enrollment


class IsInstructorOrAdmin(permissions.BasePermission):
    """Allow access only to instructors and admins."""

    def has_permission(self, request, view):
        role = getattr(request.user, "role", None)
        return role in ("instructor", "admin")


class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.select_related("course").prefetch_related(
        "questions__options"
    ).all()
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["course", "is_published"]
    search_fields = ["title", "description"]

    def get_serializer_class(self):
        if self.action in ("retrieve",):
            return QuizDetailSerializer
        return QuizListSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsInstructorOrAdmin()]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not user.is_authenticated or getattr(user, "role", None) in ("student", None):
            qs = qs.filter(is_published=True)
        elif user.role in ("instructor",):
            # Instructors see quizzes for their own courses, plus published ones
            if self.action in ("list",):
                qs = qs.filter(
                    models.Q(course__instructor=user) | models.Q(is_published=True)
                )
        return qs

    def perform_create(self, serializer):
        serializer.save()


class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.select_related("quiz__course").prefetch_related(
        "options"
    ).all()
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated, IsInstructorOrAdmin]
    filterset_fields = ["quiz"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.role == "instructor":
            qs = qs.filter(quiz__course__instructor=user)
        return qs


class OptionViewSet(viewsets.ModelViewSet):
    queryset = Option.objects.select_related("question__quiz__course").all()
    serializer_class = OptionSerializer
    permission_classes = [permissions.IsAuthenticated, IsInstructorOrAdmin]
    filterset_fields = ["question"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.role == "instructor":
            qs = qs.filter(question__quiz__course__instructor=user)
        return qs


class AttemptViewSet(viewsets.ModelViewSet):
    queryset = Attempt.objects.select_related(
        "quiz", "student"
    ).prefetch_related("results__question__options", "results__selected_options").all()
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["quiz", "status", "is_passed"]

    def get_serializer_class(self):
        return AttemptSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.role == "student":
            qs = qs.filter(student=user)
        elif user.role == "instructor":
            qs = qs.filter(quiz__course__instructor=user)
        return qs

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

    @action(detail=False, methods=["post"])
    def start(self, request):
        """Start a new attempt for a quiz."""
        quiz_id = request.data.get("quiz_id")
        if not quiz_id:
            raise ValidationError({"quiz_id": "This field is required."})

        try:
            quiz = Quiz.objects.get(id=quiz_id, is_published=True)
        except Quiz.DoesNotExist:
            raise ValidationError({"quiz_id": "Quiz not found or not published."})

        user = request.user

        # Check enrollment
        if user.role == "student":
            is_enrolled = Enrollment.objects.filter(
                student=user, course=quiz.course, status="active"
            ).exists()
            if not is_enrolled:
                raise PermissionDenied("You are not enrolled in this course.")

        # Check max attempts
        if quiz.max_attempts > 0:
            attempt_count = Attempt.objects.filter(
                quiz=quiz, student=user
            ).count()
            if attempt_count >= quiz.max_attempts:
                raise ValidationError(
                    f"Maximum attempts ({quiz.max_attempts}) reached for this quiz."
                )

        # Check for in-progress attempt
        existing = Attempt.objects.filter(
            quiz=quiz, student=user, status=Attempt.Status.IN_PROGRESS
        ).first()
        if existing:
            serializer = self.get_serializer(existing)
            return Response(serializer.data, status=status.HTTP_200_OK)

        attempt = Attempt.objects.create(
            quiz=quiz,
            student=user,
            total_questions=quiz.questions.count(),
        )
        serializer = self.get_serializer(attempt)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def submit(self, request, pk=None):
        """Submit an attempt with answers."""
        attempt = self.get_object()

        if attempt.status != Attempt.Status.IN_PROGRESS:
            raise ValidationError("This attempt has already been submitted.")

        if attempt.student != request.user:
            raise PermissionDenied("You can only submit your own attempts.")

        serializer = AttemptSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            self._evaluate_attempt(attempt, serializer.validated_data["answers"])

        result_serializer = self.get_serializer(attempt)
        return Response(result_serializer.data)

    def _evaluate_attempt(self, attempt, answers):
        """Evaluate answers and compute score."""
        quiz = attempt.quiz
        answer_map = {a["question_id"]: a["selected_option_ids"] for a in answers}
        questions = list(quiz.questions.prefetch_related("options").all())

        correct_count = 0
        total_points = 0
        earned_points = 0

        for question in questions:
            selected_ids = answer_map.get(question.id, [])
            selected_options = list(question.options.filter(id__in=selected_ids))
            correct_options = list(question.options.filter(is_correct=True))

            # Determine correctness
            selected_set = set(o.id for o in selected_options)
            correct_set = set(o.id for o in correct_options)

            if question.question_type in (
                Question.QuestionType.SINGLE_CHOICE,
                Question.QuestionType.TRUE_FALSE,
            ):
                is_correct = selected_set == correct_set
            else:  # multiple_choice: all correct must be selected, no incorrect
                is_correct = selected_set == correct_set

            points_earned = question.points if is_correct else 0
            total_points += question.points
            earned_points += points_earned

            if is_correct:
                correct_count += 1

            # Create result record
            result, _ = Result.objects.get_or_create(
                attempt=attempt, question=question
            )
            result.is_correct = is_correct
            result.points_earned = points_earned
            result.save()
            result.selected_options.set(selected_options)

        # Update attempt
        score_percentage = (earned_points / total_points * 100) if total_points > 0 else 0

        attempt.status = Attempt.Status.SUBMITTED
        attempt.score = score_percentage
        attempt.is_passed = score_percentage >= float(quiz.passing_score)
        attempt.correct_answers = correct_count
        attempt.total_questions = len(questions)
        attempt.time_taken_seconds = 0  # Could be calculated from client timestamps
        attempt.submitted_at = now()
        attempt.save()


class ResultViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Result.objects.select_related(
        "attempt", "question"
    ).prefetch_related("selected_options").all()
    serializer_class = ResultSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["attempt", "is_correct"]

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if user.role == "student":
            qs = qs.filter(attempt__student=user)
        elif user.role == "instructor":
            qs = qs.filter(attempt__quiz__course__instructor=user)
        return qs
