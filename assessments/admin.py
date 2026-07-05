from django.contrib import admin

from assessments.models import Attempt, Option, Question, Quiz, Result


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = [
        "title",
        "course",
        "passing_score",
        "time_limit_minutes",
        "max_attempts",
        "is_published",
        "created_at",
    ]
    list_filter = ["is_published", "course"]
    search_fields = ["title", "description"]
    date_hierarchy = "created_at"


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ["quiz", "text", "question_type", "order", "points"]
    list_filter = ["question_type", "quiz"]
    search_fields = ["text"]
    ordering = ["quiz", "order"]


@admin.register(Option)
class OptionAdmin(admin.ModelAdmin):
    list_display = ["question", "text", "is_correct", "order"]
    list_filter = ["is_correct", "question__quiz"]
    search_fields = ["text"]
    ordering = ["question", "order"]


@admin.register(Attempt)
class AttemptAdmin(admin.ModelAdmin):
    list_display = [
        "student",
        "quiz",
        "status",
        "score",
        "is_passed",
        "total_questions",
        "correct_answers",
        "started_at",
        "submitted_at",
    ]
    list_filter = ["status", "is_passed", "quiz"]
    search_fields = ["student__username", "student__email", "quiz__title"]
    date_hierarchy = "started_at"


@admin.register(Result)
class ResultAdmin(admin.ModelAdmin):
    list_display = ["attempt", "question", "is_correct", "points_earned"]
    list_filter = ["is_correct"]
    search_fields = ["attempt__student__username", "question__text"]
