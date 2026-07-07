import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  Bell,
  User,
  LogOut,
  Menu,
  ChevronDown,
  Users,
  DollarSign,
  BarChart3,
  ClipboardCheck,
  PlusCircle,
  PenTool,
  Settings,
  Home,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { notificationsApi } from "../../api/notifications";
import { useQuery } from "../../hooks/useQuery";

const adminLinks = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/courses", label: "Courses", icon: BookOpen },
  { to: "/admin/payments", label: "Payments", icon: DollarSign },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
];

const instructorLinks = [
  { to: "/instructor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/instructor/courses", label: "My Courses", icon: BookOpen },
  { to: "/instructor/courses/new", label: "Create Course", icon: PlusCircle },
  { to: "/instructor/quiz/new", label: "New Quiz", icon: PenTool },
  { to: "/instructor/grade", label: "Grade", icon: ClipboardCheck },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const { data: unreadData } = useQuery(
    ["unread-count"],
    () => notificationsApi.unreadCount(),
    { enabled: !!user, refetchInterval: 30000 }
  );
  const unreadCount = unreadData?.unread_count ?? 0;

  const links = user?.role === "admin" ? adminLinks : instructorLinks;
  const roleLabel = user?.role === "admin" ? "Admin Panel" : "Instructor Panel";
  const roleColor = user?.role === "admin"
    ? "from-purple-600 to-indigo-700"
    : "from-indigo-600 to-blue-700";

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white border-r border-gray-200 transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className={`flex h-16 items-center gap-3 px-6 bg-gradient-to-r ${roleColor}`}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">LMS</p>
            <p className="text-[10px] text-white/70">{roleLabel}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {links.map((link) => {
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? "bg-indigo-50 text-indigo-700 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <link.icon className={`h-5 w-5 ${active ? "text-indigo-600" : "text-gray-400"}`} />
                {link.label}
                {active && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-600" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-gray-200 px-3 py-3 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all"
          >
            <Home className="h-5 w-5 text-gray-400" />
            Back to Site
          </Link>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            {/* Breadcrumb / Page indicator */}
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
              {links
                .filter((l) => isActive(l.to))
                .slice(0, 1)
                .map((l) => (
                  <span key={l.to} className="flex items-center gap-2">
                    <l.icon className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-gray-900">{l.label}</span>
                  </span>
                ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Link
              to="/notifications"
              className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 rounded-lg p-1.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                  {(user?.first_name?.[0] || user?.username?.[0] || "?").toUpperCase()}
                </div>
                <span className="hidden sm:block">{user?.first_name || user?.username}</span>
                <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                    <div className="border-b border-gray-100 px-4 py-2.5">
                      <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                      <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    <Link
                      to="/change-password"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Settings className="h-4 w-4" />
                      Change Password
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
