"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, StoredAccount } from "@/app/context/AuthContext";
import {
  Home01Icon,
  Task01Icon,
  UserGroupIcon,
  Logout01Icon,
  UserCircleIcon,
  Wrench01Icon,
  ShieldUserIcon,
  UserSwitchIcon,
  Add01Icon,
  CheckmarkCircle01Icon,
  Settings01Icon,
} from "hugeicons-react";

const NAV: Record<string, { href: string; label: string; icon: React.ElementType }[]> = {
  USER: [
    { href: "/user/dashboard", label: "My Reports", icon: Task01Icon },
  ],
  WORKER: [
    { href: "/worker/dashboard", label: "Dashboard", icon: Home01Icon },
  ],
  ADMIN: [
    { href: "/admin/dashboard", label: "Overview", icon: Home01Icon },
    { href: "/admin/users", label: "Users", icon: UserGroupIcon },
    { href: "/admin/issues", label: "Issues", icon: Task01Icon },
  ],
};

const ROLE_META: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  USER: { icon: UserCircleIcon, color: "text-blue-500", label: "Citizen" },
  WORKER: { icon: Wrench01Icon, color: "text-amber-500", label: "Worker" },
  ADMIN: { icon: ShieldUserIcon, color: "text-brand-600", label: "Admin" },
};

function Avatar({ user }: { user: { name: string; avatarUrl?: string | null; displayName?: string | null } }) {
  const label = user.displayName || user.name;
  if (user.avatarUrl) {
    return (
      <Image
        src={user.avatarUrl}
        alt={label}
        width={32}
        height={32}
        className="w-8 h-8 rounded-full object-cover shrink-0"
      />
    );
  }
  const initials = label.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
  return (
    <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold shrink-0">
      {initials}
    </div>
  );
}

export default function Sidebar() {
  const { user, logout, accounts, addAccount, switchAccount, removeAccount } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [expanded, setExpanded] = useState(false);
  const [accountPopup, setAccountPopup] = useState(false);
  const [addingAccount, setAddingAccount] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node) &&
          sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setAccountPopup(false);
        setAddingAccount(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!user) return null;

  const meta = ROLE_META[user.role];
  const RoleIcon = meta.icon;
  const navItems = NAV[user.role] ?? [];
  const otherAccounts = accounts.filter((a) => a.user.id !== user.id);

  async function handleLogout() {
    await logout();
    router.replace("/");
  }

  async function handleAddAccount(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: loginEmail, password: loginPassword }),
    });
    const json = await res.json();
    setLoginLoading(false);
    if (!res.ok) return setLoginError(json.error ?? "Login failed");
    addAccount(json.token, json.user);
    setAddingAccount(false);
    setAccountPopup(false);
    setLoginEmail("");
    setLoginPassword("");
    router.push(
      json.user.role === "ADMIN" ? "/admin/dashboard" :
      json.user.role === "WORKER" ? "/worker/dashboard" : "/user/dashboard"
    );
  }

  return (
    <>
      <div
        ref={sidebarRef}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => { setExpanded(false); }}
        className={`fixed top-0 left-0 h-screen z-50 flex flex-col bg-white dark:bg-neutral-900 border-r border-border dark:border-neutral-800 shadow-sm transition-all duration-200 ease-out overflow-hidden ${
          expanded ? "w-60" : "w-14"
        }`}
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-4 shrink-0 hover:bg-surface-raised dark:hover:bg-neutral-800 transition"
        >
          <Image
            src="/favicon.png"
            width={32}
            height={32}
            alt="MyIfrane"
            className="w-8 h-8 shrink-0"
          />
          <span className={`font-bold text-brand-800 dark:text-brand-400 text-base whitespace-nowrap transition-opacity duration-150 ${expanded ? "opacity-100" : "opacity-0"}`}>
            MyIfrane
          </span>
        </Link>

        <div className="w-full h-px bg-border dark:bg-neutral-800 shrink-0" />

        {/* Nav items */}
        <nav className="flex-1 py-3 space-y-0.5 px-1.5 overflow-hidden">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-2.5 py-2 rounded-lg transition cursor-pointer select-none ${
                  active
                    ? "bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400"
                    : "text-text-secondary dark:text-neutral-400 hover:bg-surface-overlay dark:hover:bg-neutral-800 hover:text-text-primary dark:hover:text-neutral-100"
                }`}
              >
                <Icon size={18} className="shrink-0" />
                <span className={`text-sm font-medium whitespace-nowrap transition-opacity duration-150 ${expanded ? "opacity-100" : "opacity-0"}`}>
                  {label}
                </span>
              </Link>
            );
          })}

          {/* Profile link */}
          <Link
            href="/profile"
            className={`flex items-center gap-3 px-2.5 py-2 rounded-lg transition cursor-pointer select-none ${
              pathname === "/profile"
                ? "bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400"
                : "text-text-secondary dark:text-neutral-400 hover:bg-surface-overlay dark:hover:bg-neutral-800 hover:text-text-primary dark:hover:text-neutral-100"
            }`}
          >
            <Settings01Icon size={18} className="shrink-0" />
            <span className={`text-sm font-medium whitespace-nowrap transition-opacity duration-150 ${expanded ? "opacity-100" : "opacity-0"}`}>
              Profile
            </span>
          </Link>
        </nav>

        <div className="w-full h-px bg-border dark:bg-neutral-800 shrink-0" />

        {/* Account footer */}
        <div className="px-1.5 py-3 shrink-0">
          <button
            onClick={() => setAccountPopup((v) => !v)}
            className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-surface-overlay dark:hover:bg-neutral-800 transition cursor-pointer select-none"
          >
            <Avatar user={user} />
            <div className={`flex-1 text-left overflow-hidden transition-opacity duration-150 ${expanded ? "opacity-100" : "opacity-0"}`}>
              <p className="text-sm font-semibold text-text-primary dark:text-neutral-100 truncate leading-tight">
                {user.displayName || user.name}
              </p>
              <div className={`flex items-center gap-1 mt-0.5 ${meta.color}`}>
                <RoleIcon size={10} />
                <span className="text-[10px] font-semibold">{meta.label}</span>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Account popup */}
      {accountPopup && (
        <div
          ref={popupRef}
          className="fixed bottom-4 left-16 z-[60] w-64 bg-white dark:bg-neutral-900 rounded-xl border border-border dark:border-neutral-700 shadow-xl overflow-hidden"
        >
          {/* Current account */}
          <div className="px-4 py-3 border-b border-border dark:border-neutral-700">
            <div className="flex items-center gap-3">
              <Avatar user={user} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary dark:text-neutral-100 truncate">
                  {user.displayName || user.name}
                </p>
                <p className="text-xs text-text-secondary truncate">{user.email}</p>
              </div>
              <CheckmarkCircle01Icon size={14} className="text-brand-600 shrink-0" />
            </div>
          </div>

          {/* Other accounts */}
          {otherAccounts.length > 0 && (
            <div className="border-b border-border dark:border-neutral-700">
              {otherAccounts.map((account) => (
                <button
                  key={account.user.id}
                  onClick={() => { switchAccount(account); setAccountPopup(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-raised dark:hover:bg-neutral-800 transition cursor-pointer select-none"
                >
                  <Avatar user={account.user} />
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-text-primary dark:text-neutral-100 truncate">
                      {account.user.displayName || account.user.name}
                    </p>
                    <p className="text-xs text-text-secondary truncate">{account.user.email}</p>
                  </div>
                  <UserSwitchIcon size={14} className="text-text-tertiary shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* Add account form */}
          {addingAccount ? (
            <form onSubmit={handleAddAccount} className="px-4 py-3 space-y-2 border-b border-border dark:border-neutral-700">
              <p className="text-xs font-semibold text-text-secondary">Sign in to another account</p>
              {loginError && <p className="text-xs text-red-500">{loginError}</p>}
              <input
                type="email"
                placeholder="Email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                className="w-full border border-border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-100"
              />
              <input
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                className="w-full border border-border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-100"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="flex-1 py-1.5 bg-brand-700 text-white text-xs font-semibold rounded-lg hover:bg-brand-800 transition cursor-pointer select-none disabled:opacity-60"
                >
                  {loginLoading ? "Signing in…" : "Sign in"}
                </button>
                <button
                  type="button"
                  onClick={() => setAddingAccount(false)}
                  className="px-3 py-1.5 border border-border text-text-secondary text-xs font-semibold rounded-lg hover:bg-surface-overlay transition cursor-pointer select-none"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setAddingAccount(true)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-raised dark:hover:bg-neutral-800 transition cursor-pointer select-none border-b border-border dark:border-neutral-700"
            >
              <div className="w-8 h-8 rounded-full border-2 border-dashed border-border flex items-center justify-center shrink-0">
                <Add01Icon size={14} className="text-text-tertiary" />
              </div>
              <span className="text-sm text-text-secondary">Add account</span>
            </button>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition cursor-pointer select-none"
          >
            <Logout01Icon size={16} />
            <span className="text-sm font-medium">Sign out</span>
          </button>
        </div>
      )}
    </>
  );
}
