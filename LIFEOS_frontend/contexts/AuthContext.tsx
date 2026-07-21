import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  level: number;
  xp: number;
  maxXp: number;
  rank: string;
  streak: number;
  joinDate: string;
  timezone: string;
  theme: "dark" | "light" | "system";
  notifications: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  country?: string;
  timezone?: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, check for existing token and verify it
  useEffect(() => {
    const savedToken = localStorage.getItem("lifeos_token");
    if (savedToken) {
      setToken(savedToken);
      verifyToken(savedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async (t: string) => {
    try {
      const resp = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (resp.ok) {
        const data = await resp.json();
        const u = data?.data?.user || data?.user || data;
        setUser(mapUser(u));
        setToken(t);
      } else {
        // Token invalid/expired
        localStorage.removeItem("lifeos_token");
        setToken(null);
        setUser(null);
      }
    } catch {
      // Network error – keep token but set offline mode
      localStorage.removeItem("lifeos_token");
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const mapUser = (raw: Record<string, unknown>): User => ({
    id: String(raw.id || raw._id || ""),
    name: String(raw.name || ""),
    email: String(raw.email || ""),
    avatar: typeof raw.avatar === "string" ? raw.avatar : "",
    level: Number(raw.level || 1),
    xp: Number(raw.xp || 0),
    maxXp: Number(raw.maxXp || 1000),
    rank: String(raw.rank || "Rookie"),
    streak: Number(raw.streak || 0),
    joinDate: String(raw.joinDate || raw.createdAt || new Date().toISOString()),
    timezone: String(raw.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone),
    theme: (raw.theme as "dark" | "light" | "system") || "dark",
    notifications: Boolean(raw.notifications !== false),
  });

  const login = async (email: string, password: string) => {
    const resp = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data?.message || "Login failed");

    const t = data?.data?.accessToken || data?.accessToken || data?.token;
    const u = data?.data?.user || data?.user;

    if (!t) throw new Error("No token received");
    localStorage.setItem("lifeos_token", t);
    setToken(t);
    if (u) setUser(mapUser(u));
    else await verifyToken(t);
  };

  const register = async (formData: RegisterData) => {
    const resp = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data?.message || "Registration failed");
    // After registration, don't auto-login — redirect to verify-email
  };

  const logout = () => {
    localStorage.removeItem("lifeos_token");
    setToken(null);
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoading,
      isAuthenticated: !!token && !!user,
      login,
      register,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
