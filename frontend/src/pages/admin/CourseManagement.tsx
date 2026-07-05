import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Search,
  Eye,
  Pencil,
  CheckCircle,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { coursesApi } from "../../api/courses";
import type { Course } from "../../types";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    coursesApi
      .listCourses({})
      .then((res) => setCourses(res.data))
      .catch(() => toast.error("Failed to load courses"))
      .finally(() => setLoading(false));
  }, []);

  const togglePublish = async (course: Course) => {
    try {
      const newStatus = course.status === "published" ? "draft" : "published";
      await coursesApi.updateCourse(course.id, {
        status: newStatus,
      } as Partial<Course>);
      setCourses((prev) =>
        prev.map((c) => (c.id === course.id ? { ...c, status: newStatus } : c))
      );
      toast.success(`Course ${newStatus}`);
    } catch {
      toast.error("Failed to update course");
    }
  };

  const deleteCourse = async (course: Course) => {
    if (!window.confirm(`Delete "${course.title}"? This cannot be undone.`)) return;
    try {
      await coursesApi.deleteCourse(course.id);
      setCourses((prev) => prev.filter((c) => c.id !== course.id));
      toast.success("Course deleted");
    } catch {
      toast.error("Failed to delete course");
    }
  };

  const filtered = courses.filter((c) => {
    const matchSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
        <p className="text-gray-500">{courses.length} total courses</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Instructor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sections</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((course) => (
              <tr key={course.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-gray-400 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{course.title}</p>
                      <p className="text-xs text-gray-500">{course.category_name || "Uncategorized"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{course.instructor_name}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      course.status === "published"
                        ? "bg-green-50 text-green-700"
                        : course.status === "draft"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {course.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {parseFloat(course.price) === 0 ? (
                    <span className="text-green-600 font-medium">Free</span>
                  ) : (
                    `$${parseFloat(course.price).toFixed(2)}`
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{course.section_count}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      to={`/courses/${course.slug}`}
                      className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 transition-colors"
                      title="Preview"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => togglePublish(course)}
                      className={`rounded-lg p-2 transition-colors ${
                        course.status === "published"
                          ? "text-amber-500 hover:bg-amber-50"
                          : "text-green-500 hover:bg-green-50"
                      }`}
                      title={course.status === "published" ? "Unpublish" : "Publish"}
                    >
                      {course.status === "published" ? (
                        <XCircle className="h-4 w-4" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteCourse(course)}
                      className="rounded-lg p-2 text-red-400 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <BookOpen className="mx-auto h-8 w-8 text-gray-300 mb-2" />
            <p>No courses found</p>
          </div>
        )}
      </div>
    </div>
  );
}
