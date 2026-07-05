import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Play,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import { learningApi } from "../api/learning";
import { enrollmentsApi } from "../api/enrollments";
import type { Lesson } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";

export default function LessonPlayer() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!lessonId) return;
    setLoading(true);
    learningApi
      .getLesson(parseInt(lessonId))
      .then((res) => setLesson(res.data))
      .catch(() => toast.error("Failed to load lesson"))
      .finally(() => setLoading(false));
  }, [lessonId]);

  const markComplete = async () => {
    if (!lesson) return;
    try {
      await enrollmentsApi.createLessonProgress({
        lesson: lesson.id,
        course: lesson.course,
        is_completed: true,
      } as any);
      setCompleted(true);
      toast.success("Lesson completed!");
    } catch {
      // Might already exist — try updating
      try {
        const { data: progressList } = await enrollmentsApi.listLessonProgress({
          lesson: String(lesson.id),
        });
        if (progressList.length > 0) {
          await enrollmentsApi.updateLessonProgress(progressList[0].id, {
            is_completed: true,
          } as any);
          setCompleted(true);
          toast.success("Lesson completed!");
        }
      } catch {
        toast.error("Failed to mark as complete");
      }
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!lesson) return <div className="text-center py-16">Lesson not found</div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        to={`/courses/${lesson.course}/learn`}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back to course
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <span>{lesson.course_title}</span>
          <span>·</span>
          <span>{lesson.section_title}</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {lesson.duration_minutes} min
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
      </div>

      {/* Video player */}
      {lesson.content_type === "video" && lesson.video_url && (
        <div className="aspect-video rounded-2xl bg-black overflow-hidden mb-8">
          <video
            controls
            className="h-full w-full"
            src={lesson.video_url}
            poster=""
          >
            Your browser doesn't support video playback.
          </video>
        </div>
      )}

      {/* Content */}
      {lesson.content && (
        <div className="prose prose-gray max-w-none mb-8">
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-2 mb-4">
              {lesson.content_type === "text" ? (
                <FileText className="h-5 w-5 text-indigo-500" />
              ) : (
                <Play className="h-5 w-5 text-indigo-500" />
              )}
              <h2 className="text-lg font-semibold text-gray-900">Lesson Content</h2>
            </div>
            <div className="text-gray-600 leading-relaxed whitespace-pre-wrap">
              {lesson.content}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={markComplete}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              completed
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            <CheckCircle className="h-4 w-4" />
            {completed ? "Completed" : "Mark as Complete"}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>
          <button className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
