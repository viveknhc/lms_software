import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Award,
  BarChart3,
  CheckCircle,
  Clock,
  GraduationCap,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import { analyticsApi } from "../api/analytics";
import type { StudentDashboard as DashboardData } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";

export default function StudentDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi
      .studentDashboard()
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return <div className="text-center py-16">Failed to load dashboard</div>;

  const stats = [
    {
      label: "Enrolled Courses",
      value: data.enrollments.total,
      sub: `${data.enrollments.active} active`,
      icon: BookOpen,
      color: "bg-blue-500",
      bg: "bg-blue-50",
      text: "text-blue-600",
    },
    {
      label: "Completed",
      value: data.enrollments.completed,
      sub: `${data.enrollments.avg_completion_pct}% avg`,
      icon: CheckCircle,
      color: "bg-green-500",
      bg: "bg-green-50",
      text: "text-green-600",
    },
    {
      label: "Quiz Score",
      value: `${data.quizzes.avg_score}%`,
      sub: `${data.quizzes.passed}/${data.quizzes.total_taken} passed`,
      icon: BarChart3,
      color: "bg-purple-500",
      bg: "bg-purple-50",
      text: "text-purple-600",
    },
    {
      label: "Certificates",
      value: data.certificates_earned,
      sub: "earned",
      icon: Award,
      color: "bg-amber-500",
      bg: "bg-amber-50",
      text: "text-amber-600",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="text-gray-500">Track your learning progress</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div className={`rounded-xl ${stat.bg} p-2.5`}>
                <stat.icon className={`h-5 w-5 ${stat.text}`} />
              </div>
            </div>
            <p className="mt-4 text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Recent Courses */}
      <div className="mt-10">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Courses</h2>
        <div className="space-y-3">
          {data.recent_courses.map((course) => (
            <Link
              key={course.course_id}
              to={`/courses/${course.course_slug}`}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
                  <BookOpen className="h-5 w-5 text-indigo-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{course.course_title}</p>
                  <p className="text-xs text-gray-500 capitalize">{course.status}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{course.completion_pct}%</p>
                  <div className="mt-1 h-1.5 w-20 rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all"
                      style={{ width: `${course.completion_pct}%` }}
                    />
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </Link>
          ))}
          {data.recent_courses.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <GraduationCap className="mx-auto h-8 w-8 text-gray-300 mb-2" />
              <p>No courses yet. <Link to="/courses" className="text-indigo-600 font-medium">Browse courses</Link></p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      {data.recent_activity.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="rounded-xl border border-gray-200 bg-white">
            {data.recent_activity.slice(0, 5).map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 last:border-0"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                  <Clock className="h-4 w-4 text-gray-500" />
                </div>
                <p className="flex-1 text-sm text-gray-700">{activity.description}</p>
                <span className="text-xs text-gray-400">{activity.time_ago}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
