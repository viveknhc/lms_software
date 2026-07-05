import type { Notification } from "../types";
import client from "./client";

export const notificationsApi = {
  listNotifications: (params?: Record<string, string>) =>
    client.get<Notification[]>("/notifications/notifications/", { params }),

  unreadCount: () =>
    client.get<{ unread_count: number }>("/notifications/notifications/unread_count/"),

  markRead: (ids?: number[]) =>
    client.post("/notifications/notifications/mark_read/", {
      notification_ids: ids,
    }),

  clearAll: () =>
    client.delete("/notifications/notifications/clear_all/"),
};
