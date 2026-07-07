import type { User } from "../types";
import client from "./client";

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
  role: "student" | "instructor" | "admin";
  is_active?: boolean;
}

export const usersApi = {
  listUsers: (params?: Record<string, string>) =>
    client.get<User[]>("/auth/users/", { params }),

  getUser: (id: number) =>
    client.get<User>(`/auth/users/${id}/`),

  createUser: (data: CreateUserRequest) =>
    client.post<User>("/auth/users/", data),

  updateUser: (id: number, data: Partial<User>) =>
    client.patch<User>(`/auth/users/${id}/`, data),

  deleteUser: (id: number) =>
    client.delete(`/auth/users/${id}/`),
};
