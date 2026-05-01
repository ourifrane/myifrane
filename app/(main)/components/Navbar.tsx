"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  LogOut,
  Wrench,
  ShieldCheck,
  UserCircle,
  Menu,
  X,
} from "lucide-react";
import Image from "next/image";

const NAV: Record<string, { href: string; label: string; icon: React.ElementType }[]> = {
  USER: [{ href: "/user/dashboard", label: "My Reports", icon: ClipboardList }],
  WORKER: [{ href: "/worker/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  ADMIN: [
    { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/issues", label: "Issues", icon: ClipboardList },
  ],
};

const ROLE_META: Record<string, { icon: React.ElementType; color: string }> = {
  USER: { icon: UserCircle, color: "text-blue-600 bg-blue-50" },
  WORKER: { icon: Wrench, color: "text-amber-600 bg-amber-50" },
  ADMIN: { icon: ShieldCheck, color: "text-brand-700 bg-brand-50" },
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  async function handleLogout() {
    await logout();
    router.replace("/");
  }

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const meta = user ? ROLE_META[user.role] : null;
  const RoleIcon = meta?.icon;

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      <div className="container mx-auto max-w-5xl px-4 h-14 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="text-brand-800 font-bold text-lg tracking-tight shrink-0 flex items-center" onClick={closeMobileMenu}>
          <Image src="/favicon.png" width={500} height={500} alt="MyIfrane Icon" className="size-[3em]" />
          MyIfrane
        </Link>

        {/* Desktop Nav links */}
        {user && (
          <nav className="hidden md:flex items-center gap-1">
            {NAV[user.role]?.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    active
                      ? "bg-brand-50 text-brand-700"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-overlay"
                  }`}
                >
                  <Icon size={14} />
                  {label}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right side */}
        {user ? (
          <div className="flex items-center gap-2 ml-auto">
            {/* Role + name chip */}
            <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${meta?.color}`}>
              {RoleIcon && <RoleIcon size={12} />}
              {user.name}
              {user.role === "WORKER" && !user.approved && (
                <span className="ml-1 bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded text-[10px] font-bold">
                  PENDING
                </span>
              )}
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-text-secondary hover:text-red-600 hover:bg-red-50 transition"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              title="Menu"
              className="md:hidden p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-overlay transition"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 ml-auto">
            <Link href="/login" className="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary font-medium transition">
              Sign in
            </Link>
            <Link href="/register" className="px-4 py-1.5 bg-brand-700 text-white text-sm font-semibold rounded-lg hover:bg-brand-800 transition">
              Register
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Menu Drawer */}
      {user && mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 top-14 bg-black/20 z-40"
            onClick={closeMobileMenu}
          />
          {/* Menu */}
          <div className="md:hidden absolute top-14 left-0 right-0 bg-white border-b border-border z-40 shadow-lg">
            <nav className="flex flex-col gap-1 p-4">
              {NAV[user.role]?.map(({ href, label, icon: Icon }) => {
                const active = pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                      active
                        ? "bg-brand-50 text-brand-700"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface-overlay"
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </Link>
                );
              })}
              {/* Mobile: Show role + name in drawer */}
              <div className="sm:hidden mt-3 pt-3 border-t border-border">
                <div className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold ${meta?.color}`}>
                  {RoleIcon && <RoleIcon size={14} />}
                  <span>{user.name}</span>
                  {user.role === "WORKER" && !user.approved && (
                    <span className="ml-auto bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded text-[10px] font-bold">
                      PENDING
                    </span>
                  )}
                </div>
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
