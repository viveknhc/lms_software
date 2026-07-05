import { useEffect, useState } from "react";
import { Bell, CheckCheck, Trash2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { notificationsApi } from "../api/notifications";
import type { Notification } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const load = () => {
    setLoading(true);
    notificationsApi
      .listNotifications()
      .then((res) => setNotifications(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const markAllRead = async () => {
    setUpdating(true);
    try {
      await notificationsApi.markRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );
      toast.success("All marked as read");
    } catch {
      toast.error("Failed to mark as read");
    } finally {
      setUpdating(false);
    }
  };

  const markOneRead = async (id: number) => {
    try {
      await notificationsApi.markRead([id]);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch {
      // ignore
    }
  };

  const clearAll = async () => {
    setUpdating(true);
    try {
      await notificationsApi.clearAll();
      setNotifications([]);
      toast.success("Notifications cleared");
    } catch {
      toast.error("Failed to clear");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500">{unreadCount} unread</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              disabled={updating}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              disabled={updating}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Clear all
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          title="No notifications"
          description="You're all caught up!"
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => !notif.is_read && markOneRead(notif.id)}
              className={`rounded-xl border p-4 cursor-pointer transition-colors ${
                notif.is_read
                  ? "border-gray-100 bg-white"
                  : "border-indigo-100 bg-indigo-50/50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
                  notif.is_read ? "bg-transparent" : "bg-indigo-500"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{notif.title}</p>
                  <p className="mt-0.5 text-sm text-gray-600">{notif.message}</p>
                  <p className="mt-1 text-xs text-gray-400">{notif.time_ago}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
