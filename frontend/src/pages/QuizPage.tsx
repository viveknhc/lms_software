import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AlertCircle, CheckCircle, HelpCircle, Loader2, Timer } from "lucide-react";
import toast from "react-hot-toast";
import { quizzesApi } from "../api/quizzes";
import type { Attempt, QuizDetail } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";

export default function QuizPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [answers, setAnswers] = useState<Record<number, number[]>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!quizId) return;
    setLoading(true);
    quizzesApi
      .getQuiz(parseInt(quizId))
      .then((res) => setQuiz(res.data))
      .catch(() => toast.error("Failed to load quiz"))
      .finally(() => setLoading(false));
  }, [quizId]);

  const startQuiz = async () => {
    if (!quiz) return;
    try {
      const { data } = await quizzesApi.startAttempt(quiz.id);
      setAttempt(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to start quiz");
    }
  };

  const selectOption = (questionId: number, optionId: number, isMultiple: boolean) => {
    setAnswers((prev) => {
      const current = prev[questionId] || [];
      if (isMultiple) {
        const exists = current.includes(optionId);
        return {
          ...prev,
          [questionId]: exists
            ? current.filter((id) => id !== optionId)
            : [...current, optionId],
        };
      }
      return { ...prev, [questionId]: [optionId] };
    });
  };

  const submitQuiz = async () => {
    if (!attempt || !quiz) return;
    setSubmitting(true);
    try {
      const formattedAnswers = quiz.questions.map((q) => ({
        question_id: q.id,
        selected_option_ids: answers[q.id] || [],
      }));
      const { data } = await quizzesApi.submitAttempt(attempt.id, formattedAnswers);
      setAttempt(data);
      toast.success("Quiz submitted!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!quiz) return <div className="text-center py-16">Quiz not found</div>;

  // Show results if submitted
  if (attempt?.status === "submitted") {
    const passed = attempt.is_passed;
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className={`rounded-2xl border p-8 text-center ${
          passed ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
        }`}>
          {passed ? (
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
          ) : (
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          )}
          <h2 className={`mt-4 text-2xl font-bold ${passed ? "text-green-900" : "text-red-900"}`}>
            {passed ? "Congratulations! You Passed!" : "Not Quite"}
          </h2>
          <p className="mt-2 text-gray-600">
            Score: <span className="font-bold">{parseFloat(attempt.score || "0").toFixed(1)}%</span>
            {" · "}
            {attempt.correct_answers}/{attempt.total_questions} correct
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {attempt.results?.map((result) => (
            <div key={result.id} className={`rounded-xl border p-4 ${
              result.is_correct ? "border-green-200 bg-green-50/50" : "border-red-200 bg-red-50/50"
            }`}>
              <p className="font-medium text-gray-900">{result.question_text}</p>
              <p className="mt-1 text-sm">
                {result.is_correct ? (
                  <span className="text-green-600">Correct (+{result.points_earned} pts)</span>
                ) : (
                  <span className="text-red-600">Incorrect</span>
                )}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Not started yet
  if (!attempt) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <HelpCircle className="mx-auto h-12 w-12 text-indigo-500" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900">{quiz.title}</h1>
        <p className="mt-2 text-gray-600">{quiz.description}</p>
        <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1"><Timer className="h-4 w-4" /> {quiz.time_limit_minutes || "No"} min limit</span>
          <span>{quiz.question_count} questions</span>
          <span>Pass: {quiz.passing_score}%</span>
          <span>Max {quiz.max_attempts || "∞"} attempts</span>
        </div>
        <button
          onClick={startQuiz}
          className="mt-8 rounded-xl bg-indigo-600 px-8 py-3 font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          Start Quiz
        </button>
      </div>
    );
  }

  // In progress
  const allAnswered = quiz.questions.every((q) => (answers[q.id]?.length ?? 0) > 0);
  const isMultiple = (q: typeof quiz.questions[0]) => q.question_type === "multiple_choice";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">{quiz.title}</h1>
        <p className="text-sm text-gray-500">
          Question {Object.keys(answers).length + 1 || 1} of {quiz.questions.length}
        </p>
      </div>

      <div className="space-y-6">
        {quiz.questions.map((question, qi) => (
          <div key={question.id} className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-medium text-gray-900">
                {qi + 1}. {question.text}
              </h3>
              <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{question.points} pts</span>
            </div>
            {isMultiple(question) && (
              <p className="text-xs text-gray-400 mb-3">Select all that apply</p>
            )}
            <div className="space-y-2">
              {question.options.map((option) => {
                const selected = (answers[question.id] || []).includes(option.id);
                return (
                  <button
                    key={option.id}
                    onClick={() => selectOption(question.id, option.id, isMultiple(question))}
                    className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                      selected
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {option.text}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={submitQuiz}
          disabled={!allAnswered || submitting}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {submitting ? "Submitting..." : "Submit Quiz"}
        </button>
      </div>
    </div>
  );
}
