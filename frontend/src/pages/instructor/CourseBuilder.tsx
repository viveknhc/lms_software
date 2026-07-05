import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  BookOpen,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Save,
  Loader2,
  Video,
  FileText,
  HelpCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { coursesApi } from "../../api/courses";
import { learningApi } from "../../api/learning";
import type { Course, Section } from "../../types";
import LoadingSpinner from "../../components/LoadingSpinner";

interface LessonForm {
  title: string;
  content_type: "video" | "text" | "document" | "quiz";
  video_url: string;
  content: string;
  duration_minutes: number;
  is_free: boolean;
  order: number;
}

export default function CourseBuilder() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const isNew = courseId === "new";

  const [course, setCourse] = useState<Partial<Course>>({
    title: "",
    short_description: "",
    description: "",
    price: "0",
    status: "draft",
    category: null,
  });
  const [sections, setSections] = useState<(Section & { lessons: LessonForm[] })[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!isNew && courseId) {
      setLoading(true);
      Promise.all([
        coursesApi.listCourses({ id: courseId }),
        coursesApi.getCourseSections(courseId),
      ])
        .then(async ([courseRes, sectionsRes]) => {
          const found = courseRes.data[0];
          if (found) setCourse(found);
          const sects = sectionsRes.data;
          setSections(sects.map((s) => ({ ...s, lessons: [] })));

          // Load lessons for each section
          const lessonPromises = sects.map((s) =>
            learningApi.listLessons({ section: String(s.id) }).then((res) => ({
              sectionId: s.id,
              lessons: res.data.map((l) => ({
                title: l.title,
                content_type: l.content_type as "video" | "text" | "document" | "quiz",
                video_url: l.video_url,
                content: l.content,
                duration_minutes: l.duration_minutes,
                is_free: l.is_free,
                order: l.order,
              })),
            }))
          );
          const lessonResults = await Promise.all(lessonPromises);
          setSections((prev) =>
            prev.map((s) => ({
              ...s,
              lessons: lessonResults.find((r) => r.sectionId === s.id)?.lessons || [],
            }))
          );
        })
        .catch(() => toast.error("Failed to load course"))
        .finally(() => setLoading(false));
    }
  }, [isNew, courseId]);

  const addSection = () => {
    setSections((prev) => [
      ...prev,
      {
        id: -Date.now(),
        course: 0,
        title: "",
        order: prev.length,
        lesson_count: 0,
        created_at: "",
        lessons: [],
      } as Section & { lessons: LessonForm[] },
    ]);
  };

  const removeSection = async (index: number) => {
    const section = sections[index];
    if (section.id > 0) {
      try {
        await coursesApi.deleteSection(section.id);
      } catch {
        // ignore
      }
    }
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSectionTitle = (index: number, title: string) => {
    setSections((prev) => prev.map((s, i) => (i === index ? { ...s, title } : s)));
  };

  const addLesson = (sectionIndex: number) => {
    setSections((prev) =>
      prev.map((s, i) =>
        i === sectionIndex
          ? {
              ...s,
              lessons: [
                ...s.lessons,
                {
                  title: "",
                  content_type: "text" as const,
                  video_url: "",
                  content: "",
                  duration_minutes: 10,
                  is_free: false,
                  order: s.lessons.length,
                },
              ],
            }
          : s
      )
    );
  };

  const updateLesson = (
    sectionIndex: number,
    lessonIndex: number,
    data: Partial<LessonForm>
  ) => {
    setSections((prev) =>
      prev.map((s, i) =>
        i === sectionIndex
          ? {
              ...s,
              lessons: s.lessons.map((l, j) =>
                j === lessonIndex ? { ...l, ...data } : l
              ),
            }
          : s
      )
    );
  };

  const removeLesson = (sectionIndex: number, lessonIndex: number) => {
    setSections((prev) =>
      prev.map((s, i) =>
        i === sectionIndex
          ? { ...s, lessons: s.lessons.filter((_, j) => j !== lessonIndex) }
          : s
      )
    );
  };

  const handleSave = async () => {
    if (!course.title?.trim()) {
      toast.error("Course title is required");
      return;
    }
    setSaving(true);
    try {
      let savedCourse: Course;
      if (isNew) {
        const { data } = await coursesApi.createCourse({
          ...course,
          status: "draft",
        } as Partial<Course>);
        savedCourse = data;
      } else {
        const { data } = await coursesApi.updateCourse(Number(courseId), course as Partial<Course>);
        savedCourse = data;
      }        // Save sections and lessons
      for (let si = 0; si < sections.length; si++) {
        const section = sections[si];
        let savedSection: Section;

        if (section.id < 0) {
          // New section
          const { data } = await coursesApi.createSection({
            course: savedCourse.id,
            title: section.title,
            order: si,
          } as Partial<Section>);
          savedSection = data;
        } else {
          // Update existing section
          const { data } = await coursesApi.updateSection(section.id, {
            title: section.title,
            order: si,
          } as Partial<Section>);
          savedSection = data;

          // Delete existing lessons for this section to avoid duplicates
          const existingLessons = (await learningApi.listLessons({ section: String(section.id) })).data;
          for (const existing of existingLessons) {
            try { await learningApi.deleteLesson(existing.id); } catch { /* ignore */ }
          }
        }

        // Save lessons
        for (let li = 0; li < section.lessons.length; li++) {
          const lesson = section.lessons[li];
          await learningApi.createLesson({
            section: savedSection.id,
            title: lesson.title,
            content_type: lesson.content_type,
            video_url: lesson.video_url,
            content: lesson.content,
            duration_minutes: lesson.duration_minutes,
            is_free: lesson.is_free,
            order: li,
          } as any);
        }
      }

      toast.success("Course saved successfully!");
      navigate("/instructor/courses");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save course");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const contentTypes = [
    { value: "video", label: "Video", icon: Video },
    { value: "text", label: "Text", icon: FileText },
    { value: "document", label: "Document", icon: FileText },
    { value: "quiz", label: "Quiz", icon: HelpCircle },
  ] as const;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isNew ? "Create Course" : "Edit Course"}
          </h1>
          <p className="text-gray-500">Build your course content</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/instructor/courses")}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Course
          </button>
        </div>
      </div>

      {/* Course Details */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Course Details</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={course.title}
              onChange={(e) => setCourse({ ...course, title: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              placeholder="e.g. Python for Beginners"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
            <input
              type="text"
              value={course.short_description || ""}
              onChange={(e) => setCourse({ ...course, short_description: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              placeholder="Brief summary shown in course cards"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Description</label>
            <textarea
              rows={4}
              value={course.description || ""}
              onChange={(e) => setCourse({ ...course, description: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              placeholder="Detailed course description..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={course.price}
                onChange={(e) => setCourse({ ...course, price: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={course.status}
                onChange={(e) => setCourse({ ...course, status: e.target.value as "draft" | "published" | "archived" })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Sections & Lessons */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Course Content</h2>
          <button
            onClick={addSection}
            className="flex items-center gap-1.5 rounded-lg border border-indigo-200 px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Section
          </button>
        </div>

        {sections.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <BookOpen className="mx-auto h-8 w-8 text-gray-300 mb-2" />
            <p>No sections yet. Add sections to organize your course content.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sections.map((section, si) => {
              const isExpanded = expandedSections[section.id] ?? true;
              return (
                <div key={section.id} className="rounded-xl border border-gray-200 overflow-hidden">
                  <div className="flex items-center gap-3 bg-gray-50 px-4 py-3">
                    <GripVertical className="h-4 w-4 text-gray-400 cursor-move shrink-0" />
                    <button
                      onClick={() =>
                        setExpandedSections((prev) => ({
                          ...prev,
                          [section.id]: !isExpanded,
                        }))
                      }
                      className="text-gray-400"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => updateSectionTitle(si, e.target.value)}
                      className="flex-1 bg-transparent text-sm font-medium text-gray-900 outline-none border-none"
                      placeholder="Section title (e.g. Getting Started)"
                    />
                    <span className="text-xs text-gray-400">{section.lessons.length} lessons</span>
                    <button
                      onClick={() => removeSection(si)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-3 pt-2 space-y-2">
                      {section.lessons.map((lesson, li) => (
                        <div
                          key={li}
                          className="rounded-lg border border-gray-100 bg-white p-3"
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="text"
                              value={lesson.title}
                              onChange={(e) => updateLesson(si, li, { title: e.target.value })}
                              className="flex-1 text-sm text-gray-900 outline-none border-b border-transparent focus:border-gray-300 pb-0.5"
                              placeholder="Lesson title"
                            />
                            <select
                              value={lesson.content_type}
                              onChange={(e) =>
                                updateLesson(si, li, {
                                  content_type: e.target.value as "video" | "text" | "document" | "quiz",
                                })
                              }
                              className="text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none"
                            >
                              {contentTypes.map((ct) => (
                                <option key={ct.value} value={ct.value}>
                                  {ct.label}
                                </option>
                              ))}
                            </select>
                            <input
                              type="number"
                              value={lesson.duration_minutes}
                              onChange={(e) =>
                                updateLesson(si, li, {
                                  duration_minutes: parseInt(e.target.value) || 0,
                                })
                              }
                              className="w-16 text-xs text-center border border-gray-200 rounded-lg px-2 py-1 outline-none"
                              placeholder="Min"
                              title="Duration in minutes"
                            />
                            <button
                              onClick={() => removeLesson(si, li)}
                              className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          {lesson.content_type === "video" && (
                            <input
                              type="url"
                              value={lesson.video_url}
                              onChange={(e) => updateLesson(si, li, { video_url: e.target.value })}
                              className="mt-2 w-full text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none"
                              placeholder="Video URL (YouTube, Vimeo, etc.)"
                            />
                          )}

                          {lesson.content_type === "text" && (
                            <textarea
                              value={lesson.content}
                              onChange={(e) => updateLesson(si, li, { content: e.target.value })}
                              rows={3}
                              className="mt-2 w-full text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none"
                              placeholder="Lesson content (supports HTML)"
                            />
                          )}

                          <label className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                            <input
                              type="checkbox"
                              checked={lesson.is_free}
                              onChange={(e) => updateLesson(si, li, { is_free: e.target.checked })}
                              className="rounded border-gray-300"
                            />
                            Free preview (no enrollment required)
                          </label>
                        </div>
                      ))}
                      <button
                        onClick={() => addLesson(si)}
                        className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Lesson
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
