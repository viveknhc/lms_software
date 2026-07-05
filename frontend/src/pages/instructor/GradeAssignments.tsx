import { useEffect, useState } from "react";
import {
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  Loader2,
  ArrowLeft,
  Send,
} from "lucide-react";
import toast from "react-hot-toast";
import { assignmentsApi } from "../../api/assignments";
import { coursesApi } from "../../api/courses";
import type { Assignment, Course, Submission } from "../../types";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function GradeAssignments() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<string>("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [gradingId, setGradingId] = useState<number | null>(null);
  const [gradeData, setGradeData] = useState<Record<number, { points_earned: string; feedback: string }>>({});

  useEffect(() => {
    coursesApi
      .listCourses({})
      .then((res) => setCourses(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedCourse) {
      setAssignments([]);
      return;
    }
    assignmentsApi
      .listAssignments({ course: selectedCourse })
      .then((res) => setAssignments(res.data))
      .catch(() => {});
  }, [selectedCourse]);

  useEffect(() => {
    if (!selectedAssignment) {
      setSubmissions([]);
      return;
    }
    assignmentsApi
      .listSubmissions({ assignment: selectedAssignment })
      .then((res) => setSubmissions(res.data))
      .catch(() => {});
  }, [selectedAssignment]);

  const handleGrade = async (submission: Submission) => {
    const data = gradeData[submission.id];
    if (!data || !data.points_earned) {
      toast.error("Enter points earned");
      return;
    }
    setGradingId(submission.id);
    try {
      await assignmentsApi.gradeSubmission(submission.id, {
        points_earned: parseFloat(data.points_earned),
        feedback: data.feedback,
      });
      toast.success("Submission graded!");
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === submission.id
            ? {
                ...s,
                status: "graded" as const,
                grade: {
                  id: 0,
                  submission: s.id,
                  graded_by: 0,
                  grader_name: "You",
                  points_earned: data.points_earned,
                  feedback: data.feedback,
                  is_passed: parseFloat(data.points_earned) >= submission.assignment.total_points * 0.5,
                  graded_at: new Date().toISOString(),
                },
              }
            : s
        )
      );
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to grade");
    } finally {
      setGradingId(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  const statusIcon = (status: string) => {
    switch (status) {
      case "submitted":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "graded":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "late":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Grade Assignments</h1>
        <p className="text-gray-500">Review and grade student submissions</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <select
          value={selectedCourse}
          onChange={(e) => {
            setSelectedCourse(e.target.value);
            setSelectedAssignment("");
          }}
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
        >
          <option value="">All Courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
        <select
          value={selectedAssignment}
          onChange={(e) => setSelectedAssignment(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
          disabled={!selectedCourse}
        >
          <option value="">All Assignments</option>
          {assignments.map((a) => (
            <option key={a.id} value={a.id}>
              {a.title}
            </option>
          ))}
        </select>
      </div>

      {/* Submissions */}
      {submissions.length === 0 ? (
        <div className="text-center py-16 text-gray-500 rounded-2xl border border-gray-200 bg-white">
          <FileText className="mx-auto h-8 w-8 text-gray-300 mb-2" />
          <p>No submissions to review</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => {
            const assignment = assignments.find((a) => a.id === submission.assignment);
            const gd = gradeData[submission.id] || { points_earned: "", feedback: "" };

            return (
              <div
                key={submission.id}
                className="rounded-2xl border border-gray-200 bg-white overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-gray-50">
                  <div className="flex items-center gap-3">
                    {statusIcon(submission.status)}
                    <div>
                      <p className="font-medium text-gray-900">{submission.student_name}</p>
                      <p className="text-xs text-gray-500">
                        {submission.assignment_title} · Submitted {new Date(submission.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-medium rounded-full px-2.5 py-0.5 ${
                      submission.status === "graded"
                        ? "bg-green-50 text-green-700"
                        : submission.status === "late"
                        ? "bg-red-50 text-red-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {submission.status}
                  </span>
                </div>

                {/* Content */}
                <div className="px-6 py-4">
                  {submission.content && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-1">Submission:</p>
                      <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700 whitespace-pre-wrap">
                        {submission.content}
                      </div>
                    </div>
                  )}

                  {/* Already graded */}
                  {submission.grade ? (
                    <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-green-800">Graded</span>
                        <span className="text-sm font-bold text-green-800">
                          {parseFloat(submission.grade.points_earned).toFixed(0)} / {assignment?.total_points || 100} pts
                        </span>
                      </div>
                      {submission.grade.feedback && (
                        <p className="text-sm text-green-700">{submission.grade.feedback}</p>
                      )}
                      <p className="text-xs text-green-600 mt-2">
                        by {submission.grade.grader_name} · {new Date(submission.grade.graded_at).toLocaleDateString()}
                      </p>
                    </div>
                  ) : (
                    /* Grade form */
                    <div className="space-y-3">
                      <div className="flex gap-4">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Points (out of {assignment?.total_points || 100})
                          </label>
                          <input
                            type="number"
                            max={assignment?.total_points || 100}
                            value={gd.points_earned}
                            onChange={(e) =>
                              setGradeData((prev) => ({
                                ...prev,
                                [submission.id]: { ...prev[submission.id], points_earned: e.target.value },
                              }))
                            }
                            className="w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                            placeholder="Points"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs text-gray-500 mb-1">Feedback</label>
                          <input
                            type="text"
                            value={gd.feedback}
                            onChange={(e) =>
                              setGradeData((prev) => ({
                                ...prev,
                                [submission.id]: { ...prev[submission.id], feedback: e.target.value },
                              }))
                            }
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                            placeholder="Optional feedback..."
                          />
                        </div>
                        <button
                          onClick={() => handleGrade(submission)}
                          disabled={gradingId === submission.id}
                          className="self-end flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                        >
                          {gradingId === submission.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                          Grade
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
