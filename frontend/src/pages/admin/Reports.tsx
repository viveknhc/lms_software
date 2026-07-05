import { useEffect, useState } from "react";
import {
  TrendingUp,
  Users,
  BookOpen,
  DollarSign,
  Award,
  BarChart3,
  Activity,
  GraduationCap,
} from "lucide-react";
import { analyticsApi } from "../../api/analytics";
import type { AdminDashboard } from "../../types";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function Reports() {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi
      .adminDashboard()
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return <div className="text-center py-16">Failed to load reports</div>;

  const statCards = [
    {
      label: "Total Users",
      value: data.users.total,
      sub: `${data.users.new_month} new this month`,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      trend: "up",
    },
    {
      label: "Total Courses",
      value: data.courses.total,
      sub: `${data.courses.by_status.published || 0} published`,
      icon: BookOpen,
      color: "text-purple-600",
      bg: "bg-purple-50",
      trend: "up",
    },
    {
      label: "Total Enrollments",
      value: data.enrollments.total,
      sub: `${data.enrollments.new_month} this month`,
      icon: GraduationCap,
      color: "text-green-600",
      bg: "bg-green-50",
      trend: "up",
    },
    {
      label: "Revenue",
      value: `$${data.revenue.total.toFixed(2)}`,
      sub: `$${data.revenue.month.toFixed(2)} this month`,
      icon: DollarSign,
      color: "text-amber-600",
      bg: "bg-amber-50",
      trend: "up",
    },
    {
      label: "Certificates Issued",
      value: data.certificates.total_issued,
      sub: `${data.certificates.issued_week} this week`,
      icon: Award,
      color: "text-rose-600",
      bg: "bg-rose-50",
      trend: "up",
    },
    {
      label: "Avg Quiz Score",
      value: `${data.assessments.avg_quiz_score}%`,
      sub: `${data.assessments.total_quiz_attempts} attempts`,
      icon: BarChart3,
      color: "text-cyan-600",
      bg: "bg-cyan-50",
      trend: "up",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-500">Platform-wide analytics and insights</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-10">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-gray-200 bg-white p-5"
          >
            <div className={`rounded-xl ${stat.bg} p-2.5 inline-flex`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Detailed sections */}
      <div className="grid gap-6 lg:grid-cols-2 mb-10">
        {/* Users by Role */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-400" />
            Users by Role
          </h2>
          <div className="space-y-4">
            {Object.entries(data.users.by_role).map(([role, count]) => {
              const total = data.users.total;
              const pct = total > 0 ? ((count / total) * 100).toFixed(1) : "0";
              const colors: Record<string, string> = {
                student: "bg-green-500",
                instructor: "bg-blue-500",
                admin: "bg-purple-500",
              };
              return (
                <div key={role}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="capitalize text-gray-700">{role}</span>
                    <span className="font-semibold text-gray-900">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div
                      className={`h-full rounded-full ${colors[role] || "bg-gray-400"} transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Courses by Status */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-gray-400" />
            Courses by Status
          </h2>
          <div className="space-y-4">
            {Object.entries(data.courses.by_status).map(([status, count]) => {
              const total = data.courses.total;
              const pct = total > 0 ? ((count / total) * 100).toFixed(1) : "0";
              const colors: Record<string, string> = {
                published: "bg-green-500",
                draft: "bg-amber-500",
                archived: "bg-gray-500",
              };
              return (
                <div key={status}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="capitalize text-gray-700">{status}</span>
                    <span className="font-semibold text-gray-900">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div
                      className={`h-full rounded-full ${colors[status] || "bg-gray-400"} transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-gray-400" />
          Recent Activity
        </h2>
        <div className="space-y-0">
          {data.recent_activity.slice(0, 15).map((activity) => (
            <div
              key={activity.id}
              className="flex items-center gap-3 border-b border-gray-50 py-3 last:border-0"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                <Activity className="h-4 w-4 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 truncate">{activity.description}</p>
                <p className="text-xs text-gray-400">{activity.user_name} · {activity.time_ago}</p>
              </div>
              <span className="text-xs text-gray-400 capitalize shrink-0">
                {activity.user_role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
