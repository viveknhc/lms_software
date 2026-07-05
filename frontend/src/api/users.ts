import type { User } from "../types";
import client from "./client";

export const usersApi = {
  listUsers: (params?: Record<string, string>) =>
    client.get<User[]>("/accounts/users/", { params }),

  getUser: (id: number) =>
    client.get<User>(`/accounts/users/${id}/`),

  updateUser: (id: number, data: Partial<User>) =>
    client.patch<User>(`/accounts/users/${id}/`, data),

  deleteUser: (id: number) =>
    client.delete(`/accounts/users/${id}/`),
};
