"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { apiFetch } from "@/src/lib/api-client";
import { apiRoutes } from "@/src/lib/api-routes";
import type { RegisterInput, UserPrivate } from "@/src/lib/types";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  user: UserPrivate | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserPrivate | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    let active = true;

    apiFetch<UserPrivate>(apiRoutes.auth.me)
      .then((currentUser) => {
        if (!active) return;
        setUser(currentUser);
        setStatus("authenticated");
      })
      .catch(() => {
        if (!active) return;
        setUser(null);
        setStatus("unauthenticated");
      });

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user: loggedInUser } = await apiFetch<{ user: UserPrivate }>(
      apiRoutes.auth.login,
      { method: "POST", body: { email, password } },
    );
    setUser(loggedInUser);
    setStatus("authenticated");
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const { user: registeredUser } = await apiFetch<{ user: UserPrivate }>(
      apiRoutes.auth.register,
      { method: "POST", body: input },
    );
    setUser(registeredUser);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(async () => {
    await apiFetch(apiRoutes.auth.logout, { method: "POST" });
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  return (
    <AuthContext.Provider value={{ user, status, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
