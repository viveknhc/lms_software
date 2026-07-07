import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
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
} from "lucide-react";
import toast from "react-hot-toast";
import { learningApi } from "../api/learning";
import { enrollmentsApi } from "../api/enrollments";
import type { Lesson } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";

// ── Video Player Component ──────────────────────────────────────────

function VideoPlayer({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
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

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsBuffering(false);
    }
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

  const handleWaiting = () => setIsBuffering(true);
  const handleCanPlay = () => setIsBuffering(false);

  const showControlsTemporarily = () => {
    setShowControls(true);
    clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

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
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onWaiting={handleWaiting}
        onCanPlay={handleCanPlay}
        onEnded={() => setIsPlaying(false)}
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

  // Determine video source — prefer uploaded file over external URL
  const videoSrc = lesson.video_url || "";

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
      {lesson.content_type === "video" && videoSrc && <VideoPlayer src={videoSrc} />}

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
