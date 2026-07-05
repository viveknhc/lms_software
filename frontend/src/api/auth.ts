import type {
  AuthTokens,
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
  User,
} from "../types";
import client from "./client";

export const authApi = {
  register: (data: RegisterRequest) =>
    client.post<AuthTokens & { user: User }>("/auth/register/", data),

  login: (data: LoginRequest) =>
    client.post<AuthTokens>("/auth/login/", data),

  refresh: (refresh: string) =>
    client.post<AuthTokens>("/auth/token/refresh/", { refresh }),

  me: () => client.get<User>("/auth/me/"),

  updateProfile: (data: Partial<User>) =>
    client.patch<User>("/auth/me/", data),

  changePassword: (data: ChangePasswordRequest) =>
    client.post("/auth/change-password/", data),

  logout: (refresh: string) =>
    client.post("/auth/logout/", { refresh }),
};
