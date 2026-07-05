import { useEffect, useState } from "react";
import {
  Users,
  BookOpen,
  DollarSign,
  Award,
  TrendingUp,
  BarChart3,
  Activity,
  Clock,
  UserCheck,
  GraduationCap,
} from "lucide-react";
import { analyticsApi } from "../api/analytics";
import type { AdminDashboard as DashboardData } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi
      .adminDashboard()
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return <div className="text-center py-16">Failed to load dashboard</div>;

  const stats = [
    {
      label: "Total Users",
      value: data.users.total,
      sub: `${data.users.new_week} new this week`,
      icon: Users,
      bg: "bg-blue-50",
      text: "text-blue-600",
    },
    {
      label: "Courses",
      value: data.courses.total,
      sub: `${data.courses.by_status.published || 0} published`,
      icon: BookOpen,
      bg: "bg-purple-50",
      text: "text-purple-600",
    },
    {
      label: "Enrollments",
      value: data.enrollments.total,
      sub: `${data.enrollments.new_week} this week`,
      icon: TrendingUp,
      bg: "bg-green-50",
      text: "text-green-600",
    },
    {
      label: "Revenue",
      value: `$${data.revenue.total.toFixed(2)}`,
      sub: `$${data.revenue.week.toFixed(2)} this week`,
      icon: DollarSign,
      bg: "bg-amber-50",
      text: "text-amber-600",
    },
    {
      label: "Certificates",
      value: data.certificates.total_issued,
      sub: `${data.certificates.issued_week} this week`,
      icon: Award,
      bg: "bg-rose-50",
      text: "text-rose-600",
    },
    {
      label: "Avg Quiz Score",
      value: `${data.assessments.avg_quiz_score}%`,
      sub: `${data.assessments.total_quiz_attempts} attempts`,
      icon: BarChart3,
      bg: "bg-cyan-50",
      text: "text-cyan-600",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500">Platform-wide analytics and management</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className={`rounded-xl ${stat.bg} p-2 inline-flex`}>
              <stat.icon className={`h-4 w-4 ${stat.text}`} />
            </div>
            <p className="mt-3 text-xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Users detail */}
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Users by Role</h2>
          <div className="space-y-3">
            {Object.entries(data.users.by_role).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-gray-400" />
                  <span className="text-sm capitalize text-gray-700">{role}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
            <span className="text-sm text-gray-500">New this month</span>
            <span className="text-sm font-semibold text-gray-900">+{data.users.new_month}</span>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Activity Overview</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Total Activities</span>
              <span className="text-sm font-semibold text-gray-900">{data.activity.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">This Week</span>
              <span className="text-sm font-semibold text-gray-900">{data.activity.week}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">This Month</span>
              <span className="text-sm font-semibold text-gray-900">{data.activity.month}</span>
            </div>
          </div>
          {Object.keys(data.activity.top_actions).length > 0 && (
            <div className="mt-4 border-t border-gray-100 pt-3">
              <p className="text-xs text-gray-500 mb-2">Top Actions</p>
              <div className="space-y-1">
                {Object.entries(data.activity.top_actions).slice(0, 5).map(([action, count]) => (
                  <div key={action} className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 capitalize">{action.replace(/_/g, " ")}</span>
                    <span className="text-xs font-medium text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Courses by Category */}
      {Object.keys(data.courses.by_category).length > 0 && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Courses by Category</h2>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Object.entries(data.courses.by_category).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                <span className="text-sm text-gray-700">{category}</span>
                <span className="text-sm font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {data.recent_activity.length > 0 && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Platform Activity</h2>
          <div className="space-y-0">
            {data.recent_activity.slice(0, 10).map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-3 border-b border-gray-50 py-2.5 last:border-0"
              >
                <Activity className="h-4 w-4 text-gray-400 shrink-0" />
                <p className="flex-1 text-sm text-gray-700">{activity.description}</p>
                <span className="text-xs text-gray-400 shrink-0">{activity.time_ago}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
