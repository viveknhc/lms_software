import { useEffect, useState } from "react";
import {
  Users,
  DollarSign,
  Clock,
  Search,
  CheckCircle,
  GraduationCap,
} from "lucide-react";
import toast from "react-hot-toast";
import { financeApi, type AccountsDashboard } from "../../api/finance";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function InstructorSalaries() {
  const [data, setData] = useState<AccountsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    financeApi
      .dashboard()
      .then((res) => setData(res.data))
      .catch(() => toast.error("Failed to load salary data"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return <div className="text-center py-16 text-gray-500">Failed to load salary data</div>;

  const salaryStatCards = [
    {
      label: "Total Salary Paid",
      value: `$${parseFloat(data.total_salary_paid).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      sub: `${data.total_instructors_with_salary} instructors`,
      icon: DollarSign,
      bg: "bg-green-50",
      text: "text-green-600",
    },
    {
      label: "Pending Salary",
      value: `$${parseFloat(data.total_salary_pending).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      sub: `${data.instructors_with_pending} pending payments`,
      icon: Clock,
      bg: "bg-amber-50",
      text: "text-amber-600",
    },
    {
      label: "Instructors",
      value: data.total_instructors_with_salary,
      sub: "with salary records",
      icon: Users,
      bg: "bg-purple-50",
      text: "text-purple-600",
    },
  ];

  const salaryStatusStyle = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-50 text-green-700";
      case "pending": return "bg-amber-50 text-amber-700";
      case "cancelled": return "bg-red-50 text-red-700";
      default: return "bg-gray-50 text-gray-700";
    }
  };

  const filteredSalaries = data.recent_salaries.filter(
    (s) =>
      !search ||
      s.instructor_name.toLowerCase().includes(search.toLowerCase()) ||
      s.courses_taught.some((c) => c.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Instructor Salaries</h1>
        <p className="text-gray-500">Manage instructor salary records</p>
      </div>

      {/* Salary Stats */}
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        {salaryStatCards.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow">
            <div className={`rounded-xl ${stat.bg} p-2 inline-flex`}>
              <stat.icon className={`h-4 w-4 ${stat.text}`} />
            </div>
            <p className="mt-3 text-xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by instructor or course..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
        />
      </div>

      {/* Instructor Salaries Table - Desktop */}
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden hidden sm:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Instructor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Courses Handled</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Comm. %</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Bonus</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Deductions</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Net Salary</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredSalaries.map((sal) => (
              <tr key={sal.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-xs font-semibold text-purple-700">
                      {sal.instructor_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{sal.instructor_name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {sal.courses_taught.map((course, i) => (
                      <span key={i} className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700">
                        {course}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(sal.year, sal.month - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </td>
                <td className="px-6 py-4 text-sm text-right font-medium text-indigo-600">
                  {sal.commission_percentage}%
                </td>
                <td className="px-6 py-4 text-sm text-right font-medium text-gray-900">
                  ${parseFloat(sal.total_revenue).toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm text-right font-medium text-green-600">
                  +${parseFloat(sal.bonus).toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm text-right font-medium text-red-600">
                  -${parseFloat(sal.deductions).toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm text-right font-bold text-gray-900">
                  ${parseFloat(sal.net_salary).toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${salaryStatusStyle(sal.payment_status)}`}>
                    {sal.payment_status === "paid" ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                    {sal.payment_status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {sal.payment_date ? new Date(sal.payment_date).toLocaleDateString() : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredSalaries.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <GraduationCap className="mx-auto h-8 w-8 text-gray-300 mb-2" />
            <p>No salary records found</p>
          </div>
        )}
      </div>

      {/* Instructor Salaries Cards - Mobile */}
      <div className="sm:hidden space-y-3">
        {filteredSalaries.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <GraduationCap className="mx-auto h-8 w-8 text-gray-300 mb-2" />
            <p>No salary records found</p>
          </div>
        ) : (
          filteredSalaries.map((sal) => (
            <div key={sal.id} className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-xs font-semibold text-purple-700">
                    {sal.instructor_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{sal.instructor_name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(sal.year, sal.month - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${salaryStatusStyle(sal.payment_status)}`}>
                  {sal.payment_status === "paid" ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                  {sal.payment_status}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {sal.courses_taught.map((course, i) => (
                  <span key={i} className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700">
                    {course}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Commission</p>
                  <p className="text-sm font-medium text-indigo-600">{sal.commission_percentage}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Revenue</p>
                  <p className="text-sm font-semibold text-gray-900">${parseFloat(sal.total_revenue).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Bonus</p>
                  <p className="text-sm font-semibold text-green-600">+${parseFloat(sal.bonus).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Deductions</p>
                  <p className="text-sm font-semibold text-red-600">-${parseFloat(sal.deductions).toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Net Salary</p>
                  <p className="text-base font-bold text-gray-900">${parseFloat(sal.net_salary).toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Paid Date</p>
                  <p className="text-xs text-gray-500">{sal.payment_date ? new Date(sal.payment_date).toLocaleDateString() : "-"}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
