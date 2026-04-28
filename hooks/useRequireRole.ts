"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, AuthUser } from "@/app/context/AuthContext";

/**
 * Redirects to / if the user isn't logged in or doesn't have the required role.
 * Returns { user, loading } — user is typed and non-null only when the role matches.
 */
export function useRequireRole(role: AuthUser["role"]): {
  user: AuthUser | null;
  loading: boolean;
} {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== role) router.replace("/");
  }, [user, loading, role, router]);

  const authed = !loading && user?.role === role ? user : null;
  return { user: authed, loading };
}
