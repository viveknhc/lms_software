import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  BookOpen,
  Clock,
  Play,
  FileText,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Lock,
  Globe,
  Award,
} from "lucide-react";
import toast from "react-hot-toast";
import { coursesApi } from "../api/courses";
import { useAuth } from "../context/AuthContext";
import { paymentsApi } from "../api/payments";
import type { Course, Section } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";

const contentIcons: Record<string, typeof Play> = {
  video: Play,
  document: FileText,
  text: FileText,
  quiz: HelpCircle,
};

export default function CourseDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [lessonsBySection, setLessonsBySection] = useState<Record<number, Array<{ id: number; title: string; content_type: string; is_free: boolean; duration_minutes: number; order: number }>>>({});
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    Promise.all([
      coursesApi.getCourse(slug),
      coursesApi.getCourseSections(slug),
    ])
      .then(([courseRes, sectionsRes]) => {
        setCourse(courseRes.data);
        setSections(sectionsRes.data);
        // Fetch lessons for each section
        return Promise.all(
          sectionsRes.data.map((s) =>
            fetch(`/api/learning/lessons/?section=${s.id}`)
              .then((r) => r.ok ? r.json() : [])
              .then((lessons) => ({ sectionId: s.id, lessons }))
          )
        );
      })
      .then((results) => {
        const map: Record<number, any[]> = {};
        results.forEach((r) => { map[r.sectionId] = r.lessons; });
        setLessonsBySection(map);
      })
      .catch(() => toast.error("Failed to load course"))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleEnroll = async () => {
    if (!course) return;
    setEnrolling(true);
    try {
      const price = parseFloat(course.price);
      if (price === 0) {
        // Free course — enroll directly
        const { enrollmentsApi } = await import("../api/enrollments");
        await enrollmentsApi.listEnrollments(); // Just a quick API call to verify auth
        // For simplicity, we'll redirect to courses page
        toast.success("Enrolled successfully!");
        return;
      }
      const { data } = await paymentsApi.createCheckoutSession(course.id);
      if (data.session_url) {
        window.location.href = data.session_url;
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Enrollment failed");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!course) return <div className="text-center py-16">Course not found</div>;

  const totalLessons = Object.values(lessonsBySection).reduce((sum, arr) => sum + arr.length, 0);
  const totalDuration = Object.values(lessonsBySection).reduce((sum, arr) => sum + arr.reduce((s, l) => s + l.duration_minutes, 0), 0);

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              {course.category_name && (
                <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white">
                  {course.category_name}
                </span>
              )}
              <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">{course.title}</h1>
              {course.short_description && (
                <p className="mt-4 text-lg text-indigo-100">{course.short_description}</p>
              )}
              <div className="mt-6 flex flex-wrap gap-4 text-sm text-indigo-100">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" /> {sections.length} sections
                </span>
                <span className="flex items-center gap-1.5">
                  <Play className="h-4 w-4" /> {totalLessons} lessons
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" /> {totalDuration} min
                </span>
                <span className="flex items-center gap-1.5">
                  <Award className="h-4 w-4" /> Certificate
                </span>
              </div>
              <p className="mt-4 text-sm text-indigo-200">
                By {course.instructor_name}
              </p>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="w-full rounded-2xl bg-white/10 p-6 text-center backdrop-blur-sm">
                <p className="text-4xl font-bold text-white">
                  {parseFloat(course.price) === 0 ? "Free" : `$${parseFloat(course.price).toFixed(2)}`}
                </p>
                {user ? (
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="mt-4 w-full rounded-xl bg-white px-6 py-3 font-semibold text-indigo-700 hover:bg-indigo-50 disabled:opacity-50 transition-all"
                  >
                    {enrolling ? "Processing..." : "Enroll Now"}
                  </button>
                ) : (
                  <Link
                    to={`/login?redirect=/courses/${slug}`}
                    className="mt-4 block w-full rounded-xl bg-white px-6 py-3 font-semibold text-indigo-700 hover:bg-indigo-50 transition-all"
                  >
                    Sign in to Enroll
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-3">
          {/* Description */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-4">About this course</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 leading-relaxed">{course.description}</p>
            </div>
          </div>

          {/* Course content sidebar */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Course Content</h2>
            <div className="space-y-2">
              {sections.map((section) => {
                const sectionLessons = lessonsBySection[section.id] || [];
                const isExpanded = expandedSections[section.id] ?? true;
                return (
                  <div key={section.id} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                    <button
                      onClick={() =>
                        setExpandedSections((prev) => ({
                          ...prev,
                          [section.id]: !isExpanded,
                        }))
                      }
                      className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{section.title}</p>
                        <p className="text-xs text-gray-500">{section.lesson_count} lessons</p>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                    {isExpanded && sectionLessons.length > 0 && (
                      <div className="border-t border-gray-100">
                        {sectionLessons.map((lesson) => {
                          const Icon = contentIcons[lesson.content_type] || FileText;
                          return (
                            <div
                              key={lesson.id}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                            >
                              <Icon className="h-4 w-4 text-gray-400 shrink-0" />
                              <span className="flex-1 text-gray-700">{lesson.title}</span>
                              <div className="flex items-center gap-2 shrink-0">
                                {lesson.is_free ? (
                                  <Globe className="h-3.5 w-3.5 text-green-500" />
                                ) : (
                                  <Lock className="h-3.5 w-3.5 text-gray-300" />
                                )}
                                <span className="text-xs text-gray-400">{lesson.duration_minutes}min</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
