"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "WORKER" | "ADMIN";
  approved: boolean;
  avatarUrl?: string | null;
  displayName?: string | null;
};

export type StoredAccount = {
  token: string;
  user: AuthUser;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  accounts: StoredAccount[];
  setUser: (user: AuthUser | null) => void;
  logout: () => Promise<void>;
  addAccount: (token: string, user: AuthUser) => void;
  switchAccount: (account: StoredAccount) => Promise<void>;
  removeAccount: (userId: string) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "myifrane_accounts";

function loadAccounts(): StoredAccount[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveAccounts(accounts: StoredAccount[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [accounts, setAccountsState] = useState<StoredAccount[]>([]);

  useEffect(() => {
    setAccountsState(loadAccounts());
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUserState(data))
      .catch(() => setUserState(null))
      .finally(() => setLoading(false));
  }, []);

  const setUser = useCallback((u: AuthUser | null) => {
    setUserState(u);
  }, []);

  const addAccount = useCallback((token: string, user: AuthUser) => {
    setAccountsState((prev) => {
      const filtered = prev.filter((a) => a.user.id !== user.id);
      const updated = [{ token, user }, ...filtered];
      saveAccounts(updated);
      return updated;
    });
    setUserState(user);
  }, []);

  const switchAccount = useCallback(async (account: StoredAccount) => {
    const res = await fetch("/api/auth/switch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: account.token }),
    });
    if (!res.ok) return;
    const freshUser = await res.json();
    setUserState(freshUser);
    setAccountsState((prev) => {
      const updated = prev.map((a) =>
        a.user.id === freshUser.id ? { ...a, user: freshUser } : a
      );
      saveAccounts(updated);
      return updated;
    });
  }, []);

  const removeAccount = useCallback((userId: string) => {
    setAccountsState((prev) => {
      const updated = prev.filter((a) => a.user.id !== userId);
      saveAccounts(updated);
      return updated;
    });
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    if (user) removeAccount(user.id);
    setUserState(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, accounts, setUser, logout, addAccount, switchAccount, removeAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
