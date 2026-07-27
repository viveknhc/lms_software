import { useEffect, useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  CreditCard,
} from "lucide-react";
import toast from "react-hot-toast";
import { financeApi, type AccountsDashboard } from "../../api/finance";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function AccountsDashboard() {
  const [data, setData] = useState<AccountsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    financeApi
      .dashboard()
      .then((res) => setData(res.data))
      .catch(() => toast.error("Failed to load accounts data"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return <div className="text-center py-16 text-gray-500">Failed to load dashboard</div>;

  const income = parseFloat(data.total_collected_fees);
  const pending = parseFloat(data.total_pending_fees);

  const feeStatCards = [
    {
      label: "Total Fees Collected",
      value: `$${income.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      sub: `${data.total_students_with_fees} students with fee records`,
      icon: DollarSign,
      bg: "bg-green-50",
      text: "text-green-600",
    },
    {
      label: "Pending Fees",
      value: `$${pending.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      sub: `${data.students_with_outstanding} students with outstanding`,
      icon: AlertTriangle,
      bg: "bg-amber-50",
      text: "text-amber-600",
    },
    {
      label: "Collection Rate",
      value: `${data.fee_collection_rate}%`,
      sub: "overall fee collection",
      icon: TrendingUp,
      bg: "bg-blue-50",
      text: "text-blue-600",
    },
  ];

  const feeStatusStyle = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-50 text-green-700 border-green-200";
      case "partial": return "bg-amber-50 text-amber-700 border-amber-200";
      case "unpaid": return "bg-red-50 text-red-700 border-red-200";
      case "overdue": return "bg-rose-50 text-rose-700 border-rose-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const feeStatusIcon = (status: string) => {
    switch (status) {
      case "paid": return <CheckCircle className="h-3.5 w-3.5" />;
      case "partial": return <Clock className="h-3.5 w-3.5" />;
      case "unpaid": return <XCircle className="h-3.5 w-3.5" />;
      case "overdue": return <AlertTriangle className="h-3.5 w-3.5" />;
      default: return <CreditCard className="h-3.5 w-3.5" />;
    }
  };

  const filteredFees = data.recent_fees.filter(
    (f) =>
      !search ||
      f.student_name.toLowerCase().includes(search.toLowerCase()) ||
      f.course_title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Student Fees</h1>
        <p className="text-gray-500">Manage student fee records</p>
      </div>

      {/* Fee Stats */}
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        {feeStatCards.map((stat) => (
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
          placeholder="Search by student or course..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
        />
      </div>

      {/* Student Fees Table - Desktop */}
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden hidden sm:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Fee</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Paid</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Due</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredFees.map((fee) => (
              <tr key={fee.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                      {fee.student_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{fee.student_name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{fee.course_title}</td>
                <td className="px-6 py-4 text-sm text-right font-medium text-gray-900">
                  ${parseFloat(fee.total_fee).toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm text-right font-medium text-green-600">
                  ${parseFloat(fee.paid_amount).toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm text-right font-medium text-red-600">
                  ${parseFloat(fee.due_amount).toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(fee.due_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border ${feeStatusStyle(fee.status)}`}>
                    {feeStatusIcon(fee.status)}
                    {fee.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredFees.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <DollarSign className="mx-auto h-8 w-8 text-gray-300 mb-2" />
            <p>No fee records found</p>
          </div>
        )}
      </div>

      {/* Student Fees Cards - Mobile */}
      <div className="sm:hidden space-y-3">
        {filteredFees.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <DollarSign className="mx-auto h-8 w-8 text-gray-300 mb-2" />
            <p>No fee records found</p>
          </div>
        ) : (
          filteredFees.map((fee) => (
            <div key={fee.id} className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                    {fee.student_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{fee.student_name}</p>
                    <p className="text-xs text-gray-500">{fee.course_title}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border ${feeStatusStyle(fee.status)}`}>
                  {feeStatusIcon(fee.status)}
                  {fee.status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Total</p>
                  <p className="text-sm font-semibold text-gray-900">${parseFloat(fee.total_fee).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Paid</p>
                  <p className="text-sm font-semibold text-green-600">${parseFloat(fee.paid_amount).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Due</p>
                  <p className="text-sm font-semibold text-red-600">${parseFloat(fee.due_amount).toFixed(2)}</p>
                </div>
              </div>
              <div className="text-xs text-gray-400">
                Due: {new Date(fee.due_date).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
