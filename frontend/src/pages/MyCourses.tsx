import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, GraduationCap } from "lucide-react";
import { enrollmentsApi } from "../api/enrollments";
import type { Enrollment } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";

export default function MyCourses() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    enrollmentsApi
      .listEnrollments()
      .then((res) => setEnrollments(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
        <p className="text-gray-500">Courses you're enrolled in</p>
      </div>

      {enrollments.length === 0 ? (
        <EmptyState
          title="Not enrolled in any courses"
          description="Browse our course catalog and start learning today"
          actionLabel="Browse Courses"
          actionTo="/courses"
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enrollment) => (
            <Link
              key={enrollment.id}
              to={`/courses/${enrollment.course_title.toLowerCase().replace(/\s+/g, "-")}`}
              className="group rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="aspect-video bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
                <BookOpen className="h-12 w-12 text-indigo-200" />
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                  {enrollment.course_title}
                </h3>
                <div className="mt-3 flex items-center justify-between">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    enrollment.status === "active"
                      ? "bg-green-50 text-green-700"
                      : enrollment.status === "completed"
                      ? "bg-blue-50 text-blue-700"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {enrollment.status}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(enrollment.enrolled_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
