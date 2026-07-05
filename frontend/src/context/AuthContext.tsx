import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authApi } from "../api/auth";
import type { AuthTokens, LoginRequest, RegisterRequest, User } from "../types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await authApi.me();
      setUser(data);
    } catch {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(
    async (credentials: LoginRequest) => {
      const { data: tokens } = await authApi.login(credentials);
      localStorage.setItem("access_token", tokens.access);
      localStorage.setItem("refresh_token", tokens.refresh);
      const { data: userData } = await authApi.me();
      setUser(userData);
      toast.success(`Welcome back, ${userData.first_name || userData.username}!`);
      navigate("/");
    },
    [navigate]
  );

  const register = useCallback(
    async (data: RegisterRequest) => {
      const { data: result } = await authApi.register(data);
      localStorage.setItem("access_token", result.access);
      localStorage.setItem("refresh_token", result.refresh);
      setUser(result.user);
      toast.success("Account created successfully!");
      navigate("/");
    },
    [navigate]
  );

  const logout = useCallback(async () => {
    const refresh = localStorage.getItem("refresh_token");
    try {
      if (refresh) {
        await authApi.logout(refresh);
      }
    } catch {
      // Ignore errors — just clear local state
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    navigate("/login");
    toast.success("Logged out.");
  }, [navigate]);

  const updateUser = useCallback(async (data: Partial<User>) => {
    const { data: updated } = await authApi.updateProfile(data);
    setUser(updated);
    toast.success("Profile updated!");
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
