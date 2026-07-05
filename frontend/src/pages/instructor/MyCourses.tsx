import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Plus,
  Pencil,
  Users,
  Eye,
  EyeOff,
  BarChart3,
  MoreHorizontal,
} from "lucide-react";
import toast from "react-hot-toast";
import { coursesApi } from "../../api/courses";
import { useAuth } from "../../context/AuthContext";
import type { Course } from "../../types";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";

export default function InstructorCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    coursesApi
      .listCourses({ instructor: String(user?.id) })
      .then((res) => setCourses(res.data))
      .catch(() => toast.error("Failed to load courses"))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const toggleStatus = async (course: Course) => {
    try {
      const newStatus = course.status === "published" ? "draft" : "published";
      await coursesApi.updateCourse(course.id, { status: newStatus } as Partial<Course>);
      setCourses((prev) =>
        prev.map((c) => (c.id === course.id ? { ...c, status: newStatus } : c))
      );
      toast.success(`Course ${newStatus === "published" ? "published" : "unpublished"}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-500">Manage your course catalog</p>
        </div>
        <Link
          to="/instructor/courses/new"
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Course
        </Link>
      </div>

      {courses.length === 0 ? (
        <EmptyState
          title="No courses yet"
          description="Create your first course to get started"
          actionLabel="Create Course"
          actionTo="/instructor/courses/new"
        />
      ) : (
        <div className="space-y-3">
          {courses.map((course) => (
            <div
              key={course.id}
              className="rounded-xl border border-gray-200 bg-white p-5 flex items-center justify-between hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50">
                  <BookOpen className="h-6 w-6 text-indigo-500" />
                </div>
                <div>
                  <Link
                    to={`/courses/${course.slug}`}
                    className="font-semibold text-gray-900 hover:text-indigo-600"
                  >
                    {course.title}
                  </Link>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        course.status === "published"
                          ? "bg-green-50 text-green-700"
                          : course.status === "draft"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {course.status}
                    </span>
                    <span>{course.section_count} sections</span>
                    {course.category_name && <span>{course.category_name}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to={`/instructor/courses/${course.id}/edit`}
                  className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50 transition-colors"
                  title="Edit course"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <Link
                  to={`/courses/${course.slug}`}
                  className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50 transition-colors"
                  title="Preview"
                >
                  <Eye className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => toggleStatus(course)}
                  className={`rounded-lg border p-2 transition-colors ${
                    course.status === "published"
                      ? "border-green-200 text-green-600 hover:bg-green-50"
                      : "border-amber-200 text-amber-600 hover:bg-amber-50"
                  }`}
                  title={course.status === "published" ? "Unpublish" : "Publish"}
                >
                  {course.status === "published" ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
