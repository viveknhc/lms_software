import { useEffect, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Play,
  FileText,
  Volume2,
  Maximize2,
  Minimize2,
  Loader2,
  Lock,
  CreditCard,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { learningApi } from "../api/learning";
import { enrollmentsApi } from "../api/enrollments";
import { paymentsApi } from "../api/payments";
import type { Lesson } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";

// ── Video Player Component ──────────────────────────────────────────

function VideoPlayer({ src, onEnded }: { src: string; onEnded?: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeout = useRef<ReturnType<typeof setTimeout>>();

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // Use requestAnimationFrame for silky-smooth progress updates
  const updateProgress = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      rafRef.current = requestAnimationFrame(updateProgress);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsBuffering(false);
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
    rafRef.current = requestAnimationFrame(updateProgress);
  };

  const handlePause = () => {
    setIsPlaying(false);
    cancelAnimationFrame(rafRef.current);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
    setCurrentTime(time);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = vol;
    }
    setVolume(vol);
    setIsMuted(vol === 0);
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Debounced buffering to avoid flickering on short network stalls
  const bufferingTimeout = useRef<ReturnType<typeof setTimeout>>();
  const handleWaiting = () => {
    // Only show buffering after a short delay (avoids flicker)
    bufferingTimeout.current = setTimeout(() => setIsBuffering(true), 300);
  };
  const handleCanPlay = () => {
    clearTimeout(bufferingTimeout.current);
    setIsBuffering(false);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    cancelAnimationFrame(rafRef.current);
    onEnded?.();
  };

  const showControlsTemporarily = () => {
    setShowControls(true);
    clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative aspect-video rounded-2xl bg-black overflow-hidden mb-8 group cursor-pointer"
      onMouseMove={showControlsTemporarily}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        className="h-full w-full"
        src={src}
        preload="metadata"
        playsInline
        // Use the streaming endpoint for better range-request support
        // (falls back to direct media URL, which also supports ranges)
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={handlePlay}
        onPause={handlePause}
        onWaiting={handleWaiting}
        onCanPlay={handleCanPlay}
        onSeeking={() => setIsBuffering(true)}
        onSeeked={() => setIsBuffering(false)}
        onEnded={handleEnded}
      />

      {/* Buffering spinner */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-white/70" />
        </div>
      )}

      {/* Big play button overlay */}
      {!isPlaying && !isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-transform hover:scale-110">
            <Play className="h-8 w-8 text-white ml-1" />
          </div>
        </div>
      )}

      {/* Controls overlay */}
      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-12 transition-opacity ${
          showControls || !isPlaying ? "opacity-100" : "opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bar */}          <input
            type="range"
            min="0"
            max={Math.floor(duration) || 0}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
          className="absolute top-0 left-0 right-0 h-1 w-full cursor-pointer appearance-none bg-white/20 accent-white outline-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0"
          style={{
            background: `linear-gradient(to right, white ${progress}%, rgba(255,255,255,0.2) ${progress}%)`,
          }}
        />

        <div className="flex items-center justify-between text-xs text-white">
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="hover:text-indigo-300 transition-colors"
            >
              {isPlaying ? (
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <Play className="h-5 w-5" />
              )}
            </button>

            {/* Time */}
            <span className="tabular-nums">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Volume */}
            <div className="flex items-center gap-1.5">
              <button onClick={toggleMute} className="hover:text-indigo-300 transition-colors">
                <Volume2 className="h-4 w-4" />
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolume}
                className="w-16 h-1 cursor-pointer appearance-none bg-white/20 accent-white rounded-full [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0"
              />
            </div>

            {/* Fullscreen */}
            <button onClick={toggleFullscreen} className="hover:text-indigo-300 transition-colors">
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main LessonPlayer Page ───────────────────────────────────────────

export default function LessonPlayer() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [courseLessons, setCourseLessons] = useState<Lesson[]>([]);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<number>>(new Set());
  const [enrollmentId, setEnrollmentId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Build navigation
  const currentIndex = courseLessons.findIndex((l) => l.id === lesson?.id);
  const prevLesson = currentIndex > 0 ? courseLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < courseLessons.length - 1 ? courseLessons[currentIndex + 1] : null;

  useEffect(() => {
    if (!lessonId) return;
    setLoading(true);
    setVideoEnded(false);
    setCompleted(false);
    setCompletedLessonIds(new Set());

    const id = parseInt(lessonId);
    learningApi
      .getLesson(id)
      .then((lessonRes) => {
        setLesson(lessonRes.data);
        const courseId = lessonRes.data.course;
        // Fetch enrollment, course lessons, and lesson progress in parallel
        return Promise.all([
          enrollmentsApi.listEnrollments({ course: String(courseId) }),
          learningApi.listLessons({ course: String(courseId) }),
          enrollmentsApi.listLessonProgress({ course: String(courseId) }),
        ]);
      })
      .then(([enrollRes, lessonsRes, progressRes]) => {
        if (enrollRes.data.length > 0) {
          setEnrollmentId(enrollRes.data[0].id);
        }
        const sorted = [...lessonsRes.data].sort((a, b) => a.order - b.order);
        setCourseLessons(sorted);
        const completedIds = new Set(
          progressRes.data
            .filter((p) => p.is_completed)
            .map((p) => p.lesson)
        );
        setCompletedLessonIds(completedIds);
        if (completedIds.has(id)) {
          setCompleted(true);
        }
      })
      .catch(() => toast.error("Failed to load lesson"))
      .finally(() => setLoading(false));
  }, [lessonId]);

  const markComplete = async () => {
    if (!lesson || completed) return;
    if (!enrollmentId) {
      toast.error("You must be enrolled in this course to mark lessons as complete");
      return;
    }
    setCompleting(true);
    try {
      await enrollmentsApi.createLessonProgress({
        lesson: lesson.id,
        course: lesson.course,
        enrollment: enrollmentId,
        is_completed: true,
        completed_at: new Date().toISOString(),
      } as any);
      setCompleted(true);
      setCompletedLessonIds((prev) => new Set(prev).add(lesson.id));
      toast.success("Lesson completed! 🎉");
    } catch {
      // Maybe already exists — try updating
      try {
        const { data: progressList } = await enrollmentsApi.listLessonProgress({
          lesson: String(lesson.id),
        });
        if (progressList.length > 0) {
          await enrollmentsApi.updateLessonProgress(progressList[0].id, {
            is_completed: true,
            completed_at: new Date().toISOString(),
          } as any);
          setCompleted(true);
          setCompletedLessonIds((prev) => new Set(prev).add(lesson.id));
          toast.success("Lesson completed! 🎉");
        }
      } catch {
        toast.error("Failed to mark as complete");
      }
    } finally {
      setCompleting(false);
    }
  };

  // Auto-mark complete when video ends
  useEffect(() => {
    if (videoEnded && !completed) {
      markComplete();
    }
  }, [videoEnded]);

  const handlePayment = async () => {
    if (!lesson) return;
    setProcessingPayment(true);
    try {
      const { data } = await paymentsApi.createCheckoutSession(lesson.course);
      if (data.session_url) {
        window.location.href = data.session_url;
      }
    } catch {
      toast.error("Failed to initiate payment. Please try again.");
    } finally {
      setProcessingPayment(false);
    }
  };

  const goToLesson = (id: number) => {
    navigate(`/lessons/${id}`);
  };

  // Flag: lesson requires payment (non-free, no enrollment)
  const needsPayment = lesson && !lesson.is_free && !enrollmentId && parseFloat(lesson.course_price) > 0;

  if (loading) return <LoadingSpinner />;
  if (!lesson) return <div className="text-center py-16">Lesson not found</div>;

  // Determine video source — use streaming endpoint for local videos
  const rawSrc = lesson.video_url || "";
  const videoSrc = rawSrc.startsWith("/media/")
    ? `/api/learning/stream-video/${rawSrc.replace("/media/lesson_videos/", "")}`
    : rawSrc;

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

      {/* Payment required overlay */}
      {needsPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => navigate(`/courses/${lesson.course}/learn`)}>
          <div
            className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => navigate(-1)}
              className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100">
              <Lock className="h-8 w-8 text-amber-600" />
            </div>

            <h2 className="text-xl font-bold text-gray-900">This lesson requires payment</h2>
            <p className="mt-2 text-sm text-gray-500">
              This lesson is part of <strong>{lesson.course_title}</strong>, which requires enrollment to access.
            </p>

            <div className="mt-6 rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Course price</p>
              <p className="text-3xl font-bold text-gray-900">
                ${parseFloat(lesson.course_price).toFixed(2)}
              </p>
            </div>

            <button
              onClick={handlePayment}
              disabled={processingPayment}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-all"
            >
              <CreditCard className="h-4 w-4" />
              {processingPayment ? "Redirecting to payment..." : "Complete Payment"}
            </button>

            <div className="mt-4 flex items-center justify-center gap-1 text-xs text-gray-400">
              <Lock className="h-3 w-3" />
              Secure payment powered by Stripe
            </div>
          </div>
        </div>
      )}

      {/* Video player */}
      {lesson.content_type === "video" && videoSrc && !needsPayment && (
        <VideoPlayer
          src={videoSrc}
          onEnded={() => setVideoEnded(true)}
        />
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

      {/* Video Ended Banner */}
      {videoEnded && completed && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-6 mb-6 text-center">
          <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-green-800">Great job!</h3>
          <p className="text-sm text-green-600 mt-1">
            This lesson has been marked as complete.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={markComplete}
            disabled={completing || completed}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              completed
                ? "bg-green-50 text-green-700 border border-green-200 cursor-default"
                : "bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            }`}
          >
            <CheckCircle className="h-4 w-4" />
            {completing ? "Saving..." : completed ? "Completed ✓" : "Mark as Complete"}
          </button>
          {videoEnded && completed && nextLesson && (
            <button
              onClick={() => goToLesson(nextLesson.id)}
              className="flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 hover:shadow-lg hover:shadow-green-200 transition-all"
            >
              Next Lesson <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={!prevLesson}
            onClick={() => prevLesson && goToLesson(prevLesson.id)}
            className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>
          <button
            disabled={!nextLesson}
            onClick={() => nextLesson && goToLesson(nextLesson.id)}
            className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Lesson list */}
      {courseLessons.length > 1 && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between mb-3 px-2">
            <h3 className="text-sm font-semibold text-gray-700">
              Course Lessons ({courseLessons.length})
            </h3>
            <span className="text-[10px] text-gray-400">
              {completedLessonIds.size} / {courseLessons.length} completed
            </span>
          </div>
          <div className="space-y-1">
            {courseLessons.map((l) => {
              const isCompleted = completedLessonIds.has(l.id);
              const isCurrent = l.id === lesson.id;
              return (
                <button
                  key={l.id}
                  onClick={() => goToLesson(l.id)}
                  className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    isCurrent
                      ? "bg-indigo-50 text-indigo-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                  ) : (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-100 text-[10px] font-medium text-gray-500 shrink-0">
                      {l.order}
                    </span>
                  )}
                  <span className={`flex-1 truncate ${isCompleted ? "text-green-700" : ""}`}>
                    {l.title}
                  </span>
                  <span className="text-[10px] text-gray-400 shrink-0">{l.duration_minutes}m</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
