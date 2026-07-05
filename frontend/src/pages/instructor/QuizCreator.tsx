import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  HelpCircle,
  Plus,
  Trash2,
  Save,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";
import { coursesApi } from "../../api/courses";
import { quizzesApi } from "../../api/quizzes";
import type { Course } from "../../types";
import LoadingSpinner from "../../components/LoadingSpinner";

interface OptionForm {
  text: string;
  is_correct: boolean;
  order: number;
}

interface QuestionForm {
  text: string;
  question_type: "single_choice" | "multiple_choice" | "true_false";
  points: number;
  order: number;
  options: OptionForm[];
}

export default function QuizCreator() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const isNew = quizId === "new";

  const [courses, setCourses] = useState<Course[]>([]);
  const [quiz, setQuiz] = useState({
    course: 0,
    title: "",
    description: "",
    time_limit_minutes: 30,
    passing_score: 60,
    max_attempts: 3,
    is_published: false,
  });
  const [questions, setQuestions] = useState<QuestionForm[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      coursesApi.listCourses({}),
      ...(isNew ? [] : [quizzesApi.getQuiz(Number(quizId))]),
    ])
      .then(([coursesRes, quizRes]) => {
        setCourses(coursesRes.data);
        if (!isNew && quizRes) {
          const q = (quizRes as any).data;
          setQuiz({
            course: q.course,
            title: q.title,
            description: q.description,
            time_limit_minutes: q.time_limit_minutes,
            passing_score: parseInt(q.passing_score),
            max_attempts: q.max_attempts,
            is_published: q.is_published,
          });
          setQuestions(
            q.questions?.map((q: any, i: number) => ({
              text: q.text,
              question_type: q.question_type,
              points: q.points,
              order: i,
              options: q.options?.map((o: any, j: number) => ({
                text: o.text,
                is_correct: false, // options don't expose is_correct in the API
                order: j,
              })) || [
                { text: "", is_correct: false, order: 0 },
                { text: "", is_correct: false, order: 1 },
              ],
            })) || []
          );
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isNew, quizId]);

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        text: "",
        question_type: "single_choice",
        points: 10,
        order: prev.length,
        options: [
          { text: "", is_correct: false, order: 0 },
          { text: "", is_correct: false, order: 1 },
        ],
      },
    ]);
  };

  const updateQuestion = (index: number, data: Partial<QuestionForm>) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, ...data } : q))
    );
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const addOption = (questionIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === questionIndex
          ? {
              ...q,
              options: [
                ...q.options,
                { text: "", is_correct: false, order: q.options.length },
              ],
            }
          : q
      )
    );
  };

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    data: Partial<OptionForm>
  ) => {
    setQuestions((prev) =>
      prev.map((q, qi) =>
        qi === questionIndex
          ? {
              ...q,
              options: q.options.map((o, oi) =>
                oi === optionIndex ? { ...o, ...data } : o
              ),
            }
          : q
      )
    );
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === questionIndex
          ? { ...q, options: q.options.filter((_, oi) => oi !== optionIndex) }
          : q
      )
    );
  };

  const handleSave = async () => {
    if (!quiz.title.trim()) {
      toast.error("Quiz title is required");
      return;
    }
    if (!quiz.course) {
      toast.error("Please select a course");
      return;
    }
    if (questions.length === 0) {
      toast.error("Add at least one question");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...quiz,
        passing_score: String(quiz.passing_score),
      };

      if (isNew) {
        await quizzesApi.createQuiz(payload as any);
      } else {
        await quizzesApi.updateQuiz(Number(quizId), payload as any);
      }

      toast.success("Quiz saved!");
      navigate("/instructor/dashboard");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save quiz");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <button
        onClick={() => navigate("/instructor/dashboard")}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </button>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isNew ? "Create Quiz" : "Edit Quiz"}
          </h1>
          <p className="text-gray-500">Build quiz questions and answers</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Quiz
        </button>
      </div>

      {/* Quiz Settings */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quiz Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course *
            </label>
            <select
              value={quiz.course}
              onChange={(e) => setQuiz({ ...quiz, course: parseInt(e.target.value) })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
            >
              <option value={0}>Select a course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={quiz.title}
              onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              placeholder="e.g. Python Basics Quiz"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={quiz.description}
              onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              placeholder="Quiz instructions or description..."
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Limit (min)
              </label>
              <input
                type="number"
                min={0}
                value={quiz.time_limit_minutes}
                onChange={(e) =>
                  setQuiz({ ...quiz, time_limit_minutes: parseInt(e.target.value) || 0 })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Passing Score (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={quiz.passing_score}
                onChange={(e) =>
                  setQuiz({ ...quiz, passing_score: parseInt(e.target.value) || 0 })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Attempts
              </label>
              <input
                type="number"
                min={1}
                value={quiz.max_attempts}
                onChange={(e) =>
                  setQuiz({ ...quiz, max_attempts: parseInt(e.target.value) || 1 })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={quiz.is_published}
              onChange={(e) => setQuiz({ ...quiz, is_published: e.target.checked })}
              className="rounded border-gray-300"
            />
            Publish quiz immediately
          </label>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            Questions ({questions.length})
          </h2>
          <button
            onClick={addQuestion}
            className="flex items-center gap-1.5 rounded-lg border border-indigo-200 px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Question
          </button>
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-12 text-gray-500 rounded-2xl border border-gray-200 bg-white">
            <HelpCircle className="mx-auto h-8 w-8 text-gray-300 mb-2" />
            <p>No questions yet. Add your first question.</p>
          </div>
        ) : (
          questions.map((question, qi) => (
            <div
              key={qi}
              className="rounded-2xl border border-gray-200 bg-white p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-500">
                  Question {qi + 1}
                </span>
                <button
                  onClick={() => removeQuestion(qi)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={question.text}
                    onChange={(e) => updateQuestion(qi, { text: e.target.value })}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                    placeholder="Enter your question"
                  />
                  <select
                    value={question.question_type}
                    onChange={(e) =>
                      updateQuestion(qi, {
                        question_type: e.target.value as "single_choice" | "multiple_choice" | "true_false",
                      })
                    }
                    className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                  >
                    <option value="single_choice">Single Choice</option>
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="true_false">True/False</option>
                  </select>
                  <input
                    type="number"
                    value={question.points}
                    onChange={(e) =>
                      updateQuestion(qi, { points: parseInt(e.target.value) || 0 })
                    }
                    className="w-20 rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                    placeholder="Points"
                  />
                </div>

                {/* Options */}
                <div className="ml-2 space-y-2">
                  {question.question_type === "true_false" ? (
                    <>
                      {["True", "False"].map((val, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${qi}`}
                            checked={question.options[oi]?.is_correct || false}
                            onChange={() => {
                              updateOption(qi, 0, { text: "True", is_correct: oi === 0 });
                              updateOption(qi, 1, { text: "False", is_correct: oi === 1 });
                            }}
                            className="rounded-full border-gray-300"
                          />
                          <span className="text-sm text-gray-700">{val}</span>
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      {question.options.map((option, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                          <input
                            type={
                              question.question_type === "multiple_choice"
                                ? "checkbox"
                                : "radio"
                            }
                            name={`correct-${qi}`}
                            checked={option.is_correct}
                            onChange={() => {
                              if (question.question_type === "multiple_choice") {
                                updateOption(qi, oi, { is_correct: !option.is_correct });
                              } else {
                                question.options.forEach((_, i) => {
                                  updateOption(qi, i, { is_correct: i === oi });
                                });
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                          <input
                            type="text"
                            value={option.text}
                            onChange={(e) => updateOption(qi, oi, { text: e.target.value })}
                            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                            placeholder={`Option ${oi + 1}`}
                          />
                          <button
                            onClick={() => removeOption(qi, oi)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addOption(qi)}
                        className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Option
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
