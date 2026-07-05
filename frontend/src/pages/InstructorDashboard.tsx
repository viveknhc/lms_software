import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  DollarSign,
  Users,
  TrendingUp,
  ChevronRight,
  Clock,
  BarChart3,
} from "lucide-react";
import { analyticsApi } from "../api/analytics";
import type { InstructorDashboard as DashboardData } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";

export default function InstructorDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi
      .instructorDashboard()
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return <div className="text-center py-16">Failed to load dashboard</div>;

  const stats = [
    {
      label: "Courses",
      value: data.courses.total,
      sub: `${data.courses.published} published`,
      icon: BookOpen,
      bg: "bg-blue-50",
      text: "text-blue-600",
    },
    {
      label: "Enrollments",
      value: data.enrollments.total,
      sub: `${data.enrollments.active} active`,
      icon: Users,
      bg: "bg-green-50",
      text: "text-green-600",
    },
    {
      label: "Revenue",
      value: `$${data.revenue.total.toFixed(2)}`,
      sub: `$${data.revenue.recent_week.toFixed(2)} this week`,
      icon: DollarSign,
      bg: "bg-amber-50",
      text: "text-amber-600",
    },
    {
      label: "Completion Rate",
      value: `${data.enrollments.completion_rate}%`,
      sub: `${data.enrollments.completed} completed`,
      icon: TrendingUp,
      bg: "bg-purple-50",
      text: "text-purple-600",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Instructor Dashboard</h1>
        <p className="text-gray-500">Manage your courses and track performance</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className={`rounded-xl ${stat.bg} p-2.5 inline-flex`}>
              <stat.icon className={`h-5 w-5 ${stat.text}`} />
            </div>
            <p className="mt-4 text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Course Breakdown */}
      <div className="mt-10">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Course Performance</h2>
        <div className="space-y-3">
          {data.course_breakdown.map((course) => (
            <Link
              key={course.course_id}
              to={`/courses/${course.slug}`}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
                  <BookOpen className="h-5 w-5 text-indigo-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{course.title}</p>
                  <p className="text-xs text-gray-500 capitalize">{course.status} · {course.total_enrollments} enrolled</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right text-sm">
                  <p className="text-gray-500">{course.active} active</p>
                  <p className="text-gray-500">{course.completed} completed</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{course.avg_completion_pct}%</p>
                  <p className="text-xs text-gray-400">avg progress</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Activity */}
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
