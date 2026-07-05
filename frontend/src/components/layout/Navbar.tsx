import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  FileText,
  Award,
  HelpCircle,
  Users,
  DollarSign,
  BarChart3,
  ClipboardCheck,
  PlusCircle,
  PenTool,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { notificationsApi } from "../../api/notifications";
import { useQuery } from "../../hooks/useQuery";

const studentLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/courses", label: "Browse Courses", icon: BookOpen },
  { to: "/my-courses", label: "My Courses", icon: GraduationCap },
  { to: "/assignments", label: "Assignments", icon: FileText },
  { to: "/certificates", label: "Certificates", icon: Award },
];

const instructorLinks = [
  { to: "/instructor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/instructor/courses", label: "My Courses", icon: BookOpen },
  { to: "/instructor/courses/new", label: "Create Course", icon: PlusCircle },
  { to: "/instructor/quiz/new", label: "New Quiz", icon: PenTool },
  { to: "/instructor/grade", label: "Grade", icon: ClipboardCheck },
];

const adminLinks = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/courses", label: "Courses", icon: BookOpen },
  { to: "/admin/payments", label: "Payments", icon: DollarSign },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const { data: unreadData } = useQuery(
    ["unread-count"],
    () => notificationsApi.unreadCount(),
    { enabled: !!user, refetchInterval: 30000 }
  );
  const unreadCount = unreadData?.unread_count ?? 0;

  const links = user?.role === "admin"
    ? adminLinks
    : user?.role === "instructor"
    ? instructorLinks
    : studentLinks;

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">LMS</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex md:items-center md:gap-1">
            {user ? (
              links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive(link.to)
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))
            ) : (
              <Link
                to="/courses"
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive("/courses")
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <BookOpen className="h-4 w-4" />
                Courses
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
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
                      {(user.first_name?.[0] || user.username[0]).toUpperCase()}
                    </div>
                    <span className="hidden sm:block">{user.first_name || user.username}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                  </button>

                  {profileOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                      <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                        <div className="border-b border-gray-100 px-4 py-2.5">
                          <p className="text-sm font-medium text-gray-900">{user.username}</p>
                          <p className="text-xs text-gray-500 capitalize">{user.role}</p>
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
                          <HelpCircle className="h-4 w-4" />
                          Change Password
                        </Link>
                        <button
                          onClick={() => { setProfileOpen(false); logout(); }}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="ml-2 rounded-lg p-2 text-gray-500 hover:bg-gray-100 md:hidden"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="border-t border-gray-200 bg-white md:hidden">
          <div className="space-y-1 px-4 py-3">
            {user ? (
              links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium ${
                    isActive(link.to)
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))
            ) : (
              <Link
                to="/courses"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                <BookOpen className="h-4 w-4" />
                Courses
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
