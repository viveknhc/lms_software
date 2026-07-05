from django.urls import include, path
from rest_framework.routers import DefaultRouter

from assessments.views import (
    AttemptViewSet,
    OptionViewSet,
    QuestionViewSet,
    QuizViewSet,
    ResultViewSet,
)

router = DefaultRouter()
router.register(r"quizzes", QuizViewSet, basename="quiz")
router.register(r"questions", QuestionViewSet, basename="question")
router.register(r"options", OptionViewSet, basename="option")
router.register(r"attempts", AttemptViewSet, basename="attempt")
router.register(r"results", ResultViewSet, basename="result")

urlpatterns = [
    path("", include(router.urls)),
]
