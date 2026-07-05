import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Search, Filter, ChevronRight } from "lucide-react";
import { coursesApi } from "../api/courses";
import type { Category, Course } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  useEffect(() => {
    Promise.all([
      coursesApi.listCourses({ status: "published" }),
      coursesApi.listCategories(),
    ])
      .then(([coursesRes, categoriesRes]) => {
        setCourses(coursesRes.data);
        setCategories(categoriesRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = courses.filter((c) => {
    const matchesSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.short_description?.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor_name?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      !selectedCategory || c.category_name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Browse Courses</h1>
        <p className="mt-2 text-gray-600">Discover courses from expert instructors</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-lg border border-gray-300 py-2.5 pl-3 pr-8 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name} ({cat.course_count})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Course grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">No courses found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => (
            <Link
              key={course.id}
              to={`/courses/${course.slug}`}
              className="group rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="aspect-video bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
                ) : (
                  <BookOpen className="h-12 w-12 text-indigo-200" />
                )}
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  {course.category_name && (
                    <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                      {course.category_name}
                    </span>
                  )}
                  <span className="text-xs text-gray-400">{course.section_count} sections</span>
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {course.title}
                </h3>
                {course.short_description && (
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">{course.short_description}</p>
                )}
                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                  <span className="text-sm text-gray-600">{course.instructor_name}</span>
                  <span className="text-lg font-bold text-gray-900">
                    {parseFloat(course.price) === 0 ? (
                      <span className="text-green-600 text-sm">Free</span>
                    ) : (
                      `$${parseFloat(course.price).toFixed(2)}`
                    )}
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
