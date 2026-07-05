import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Send,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { assignmentsApi } from "../../api/assignments";
import { enrollmentsApi } from "../../api/enrollments";
import type { Assignment, Enrollment, Submission } from "../../types";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function StudentAssignments() {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [selectedEnrollment, setSelectedEnrollment] = useState<string>("");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submitting, setSubmitting] = useState<number | null>(null);
  const [content, setContent] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [showSubmitForm, setShowSubmitForm] = useState<number | null>(null);

  useEffect(() => {
    enrollmentsApi
      .listEnrollments()
      .then((res) => setEnrollments(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedEnrollment) {
      setAssignments([]);
      return;
    }
    assignmentsApi
      .listAssignments({ course: selectedEnrollment })
      .then((res) => setAssignments(res.data))
      .catch(() => {});
  }, [selectedEnrollment]);

  const handleSubmit = async (assignmentId: number) => {
    const text = content[assignmentId]?.trim();
    if (!text) {
      toast.error("Please write your submission first");
      return;
    }
    setSubmitting(assignmentId);
    try {
      await assignmentsApi.submitAssignment(assignmentId, { content: text });
      toast.success("Assignment submitted!");
      setShowSubmitForm(null);
      setContent((prev) => ({ ...prev, [assignmentId]: "" }));
      // Refresh
      const { data } = await assignmentsApi.listAssignments({ course: selectedEnrollment });
      setAssignments(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  const statusBadge = (assignment: Assignment) => {
    if (!assignment.my_submission) return null;
    const s = assignment.my_submission;
    return (
      <span
        className={`text-xs font-medium rounded-full px-2.5 py-0.5 ${
          s.status === "graded"
            ? "bg-green-50 text-green-700"
            : s.status === "late"
            ? "bg-red-50 text-red-700"
            : "bg-blue-50 text-blue-700"
        }`}
      >
        {s.status}
      </span>
    );
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
        <p className="text-gray-500">View and submit your assignments</p>
      </div>

      <div className="mb-6">
        <select
          value={selectedEnrollment}
          onChange={(e) => setSelectedEnrollment(e.target.value)}
          className="w-full max-w-md rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
        >
          <option value="">Select a course</option>
          {enrollments.map((e) => (
            <option key={e.id} value={e.course}>
              {e.course_title}
            </option>
          ))}
        </select>
      </div>

      {assignments.length === 0 ? (
        <div className="text-center py-16 text-gray-500 rounded-2xl border border-gray-200 bg-white">
          <FileText className="mx-auto h-8 w-8 text-gray-300 mb-2" />
          <p>{selectedEnrollment ? "No assignments for this course" : "Select a course to see assignments"}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="rounded-2xl border border-gray-200 bg-white overflow-hidden"
            >
              <div className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">{assignment.title}</h3>
                      {statusBadge(assignment)}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{assignment.description}</p>
                  </div>
                  <div className="text-right text-sm text-gray-500 shrink-0 ml-4">
                    <p className="font-medium">{assignment.total_points} pts</p>
                    {assignment.due_date && (
                      <p className="flex items-center gap-1 mt-1">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(assignment.due_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                {assignment.my_submission?.grade && (
                  <div className="mt-3 rounded-lg bg-green-50 border border-green-200 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-800">
                        <CheckCircle className="h-4 w-4 inline mr-1" />
                        Graded
                      </span>
                      <span className="text-sm font-bold text-green-800">
                        {parseFloat(assignment.my_submission.grade.points_earned).toFixed(0)} / {assignment.total_points}
                      </span>
                    </div>
                    {assignment.my_submission.grade.feedback && (
                      <p className="mt-1 text-sm text-green-700">{assignment.my_submission.grade.feedback}</p>
                    )}
                  </div>
                )}

                {assignment.my_submission && !assignment.my_submission.grade ? (
                  <div className="mt-3 rounded-lg bg-blue-50 border border-blue-200 p-3">
                    <p className="text-sm text-blue-700">
                      <Clock className="h-4 w-4 inline mr-1" />
                      Submitted — awaiting grading
                    </p>
                    {assignment.my_submission.content && (
                      <div className="mt-2 text-sm text-blue-600 bg-white rounded p-2">
                        {assignment.my_submission.content}
                      </div>
                    )}
                  </div>
                ) : null}

                {!assignment.my_submission && (
                  <>
                    {showSubmitForm === assignment.id ? (
                      <div className="mt-4 space-y-3">
                        <textarea
                          rows={4}
                          value={content[assignment.id] || ""}
                          onChange={(e) =>
                            setContent((prev) => ({ ...prev, [assignment.id]: e.target.value }))
                          }
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                          placeholder="Write your answer here..."
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSubmit(assignment.id)}
                            disabled={submitting === assignment.id}
                            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                          >
                            {submitting === assignment.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                            Submit
                          </button>
                          <button
                            onClick={() => setShowSubmitForm(null)}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowSubmitForm(assignment.id)}
                        className="mt-3 flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                      >
                        Submit Assignment <ChevronRight className="h-4 w-4" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
