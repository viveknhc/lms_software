import { useEffect, useState } from "react";
import {
  Users,
  Search,
  Shield,
  UserCheck,
  UserX,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { usersApi } from "../../api/users";
import type { User } from "../../types";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  useEffect(() => {
    usersApi
      .listUsers()
      .then((res) => setUsers(res.data))
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setLoading(false));
  }, []);

  const changeRole = async (userId: number, newRole: "student" | "instructor" | "admin") => {
    try {
      await usersApi.updateUser(userId, { role: newRole } as Partial<User>);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      toast.success("Role updated!");
    } catch {
      toast.error("Failed to update role");
    }
  };

  const toggleActive = async (user: User) => {
    try {
      await usersApi.updateUser(user.id, {
        is_active: !user.is_active,
      } as Partial<User> & Record<string, unknown>);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, is_active: !u.is_active } : u
        )
      );
      toast.success(`User ${user.is_active ? "deactivated" : "activated"}`);
    } catch {
      toast.error("Failed to update user");
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !search ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.last_name?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) return <LoadingSpinner />;

  const roleColors: Record<string, string> = {
    admin: "bg-purple-50 text-purple-700",
    instructor: "bg-blue-50 text-blue-700",
    student: "bg-green-50 text-green-700",
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-500">{users.length} total users</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
        >
          <option value="">All Roles</option>
          <option value="student">Student</option>
          <option value="instructor">Instructor</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* User list */}
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <div className="divide-y divide-gray-100">
          {filteredUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                  {(user.first_name?.[0] || user.username[0]).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {user.first_name
                      ? `${user.first_name} ${user.last_name}`
                      : user.username}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm text-gray-500">{user.email}</span>
                    <span className="text-gray-300">·</span>
                    <span className="text-xs text-gray-400">@{user.username}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Role badge */}
                <select
                  value={user.role}
                  onChange={(e) =>
                    changeRole(user.id, e.target.value as "student" | "instructor" | "admin")
                  }
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium outline-none ${
                    roleColors[user.role] || "bg-gray-50 text-gray-700"
                  }`}
                >
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                  <option value="admin">Admin</option>
                </select>

                {/* Joined date */}
                <span className="text-xs text-gray-400 hidden sm:block">
                  {new Date(user.date_joined).toLocaleDateString()}
                </span>

                {/* Activate/Deactivate */}
                <button
                  onClick={() => toggleActive(user)}
                  className={`rounded-lg p-2 transition-colors ${
                    user.is_active
                      ? "text-green-600 hover:bg-green-50"
                      : "text-gray-400 hover:bg-gray-100"
                  }`}
                  title={user.is_active ? "Deactivate" : "Activate"}
                >
                  {user.email_verified ? (
                    <UserCheck className="h-4 w-4" />
                  ) : (
                    <UserX className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Users className="mx-auto h-8 w-8 text-gray-300 mb-2" />
            <p>No users found</p>
          </div>
        )}
      </div>
    </div>
  );
}
