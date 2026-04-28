"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  SortingUpIcon,
  SortingDownIcon,
  FilterIcon,
  UserCircleIcon,
  Wrench01Icon,
  ShieldUserIcon,
  CheckmarkCircle01Icon,
  Cancel01Icon,
  Alert01Icon,
  Clock01Icon,
} from "hugeicons-react";

// ─── Relative date ────────────────────────────────────────────────────────────

export function relativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: days > 365 ? "numeric" : undefined });
}

export function exactTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── ID hash → chip transform ────────────────────────────────────────────────

const TRANSFORMS = [
  "translateX(-5px) translateY(-4px) rotate(-7deg)",
  "translateX(5px) translateY(-5px) rotate(6deg)",
  "translateX(-4px) translateY(5px) rotate(8deg)",
  "translateX(6px) translateY(4px) rotate(-6deg)",
  "translateX(-6px) translateY(-3px) rotate(9deg)",
  "translateX(4px) translateY(6px) rotate(-8deg)",
  "translateX(7px) translateY(-3px) rotate(5deg)",
  "translateX(-3px) translateY(7px) rotate(-10deg)",
];

function chipTransform(id: string): string {
  const hash = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return TRANSFORMS[hash % TRANSFORMS.length];
}

// ─── Status config ────────────────────────────────────────────────────────────

export const STATUS_CONFIG: Record<string, { icon: React.ElementType; bg: string; text: string; label: string }> = {
  OPEN:      { icon: Alert01Icon,           bg: "bg-blue-100 dark:bg-blue-900/30",   text: "text-blue-700 dark:text-blue-300",   label: "Open" },
  ASSIGNED:  { icon: Clock01Icon,           bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300", label: "Assigned" },
  COMPLETED: { icon: CheckmarkCircle01Icon, bg: "bg-brand-100 dark:bg-brand-900/30", text: "text-brand-700 dark:text-brand-300", label: "Completed" },
  CANCELLED: { icon: Cancel01Icon,          bg: "bg-gray-100 dark:bg-gray-800",      text: "text-gray-500 dark:text-gray-400",   label: "Cancelled" },
};

export const ROLE_CONFIG: Record<string, { icon: React.ElementType; bg: string; text: string; label: string }> = {
  USER:   { icon: UserCircleIcon, bg: "bg-blue-100 dark:bg-blue-900/30",   text: "text-blue-700 dark:text-blue-300",   label: "Citizen" },
  WORKER: { icon: Wrench01Icon,   bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300", label: "Worker" },
  ADMIN:  { icon: ShieldUserIcon, bg: "bg-brand-100 dark:bg-brand-900/30", text: "text-brand-700 dark:text-brand-300", label: "Admin" },
};

// ─── EnumChip ─────────────────────────────────────────────────────────────────

function EnumChip({
  value,
  rowId,
  config,
}: {
  value: string;
  rowId: string;
  config: Record<string, { icon: React.ElementType; bg: string; text: string; label: string }>;
}) {
  const [hovered, setHovered] = useState(false);
  const cfg = config[value];
  if (!cfg) return <span className="text-xs text-text-tertiary">{value}</span>;
  const Icon = cfg.icon;
  const transform = chipTransform(rowId + value);

  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text} transition-transform duration-150 select-none cursor-default`}
      style={{ transform: hovered ? transform : "none" }}
    >
      <Icon size={10} />
      {cfg.label}
    </span>
  );
}

// ─── UserCell ─────────────────────────────────────────────────────────────────

function UserCell({ name, email, role, avatarUrl, displayName }: {
  name: string;
  email?: string;
  role?: string;
  avatarUrl?: string | null;
  displayName?: string | null;
}) {
  const label = displayName || name;
  const initials = label.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
  const roleCfg = role ? ROLE_CONFIG[role] : null;
  const RoleIcon = roleCfg?.icon;

  return (
    <div className="flex items-center gap-2.5 min-w-0">
      {avatarUrl ? (
        <Image src={avatarUrl} alt={label} width={28} height={28} className="w-7 h-7 rounded-full object-cover shrink-0" />
      ) : (
        <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-[10px] font-bold shrink-0">
          {initials}
        </div>
      )}
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium text-text-primary dark:text-neutral-100 truncate">{label}</p>
          {RoleIcon && roleCfg && (
            <RoleIcon size={12} className={roleCfg.text} />
          )}
        </div>
        {email && <p className="text-xs text-text-secondary truncate">{email}</p>}
      </div>
    </div>
  );
}

// ─── Column types ─────────────────────────────────────────────────────────────

type BaseCol = { label: string; sortable?: boolean };

export type ColumnDef<T> =
  | BaseCol & { type: "text"; key: keyof T & string; href?: (row: T) => string }
  | BaseCol & { type: "user"; nameKey: keyof T & string; emailKey?: keyof T & string; roleKey?: keyof T & string; avatarKey?: keyof T & string; displayNameKey?: keyof T & string }
  | BaseCol & { type: "enum"; key: keyof T & string; config: Record<string, { icon: React.ElementType; bg: string; text: string; label: string }>; options: string[] }
  | BaseCol & { type: "date"; key: keyof T & string }
  | BaseCol & { type: "actions"; render: (row: T) => React.ReactNode };

type SortDir = "asc" | "desc";

// ─── FilterMenu ───────────────────────────────────────────────────────────────

function FilterMenu({
  type,
  options,
  active,
  onSort,
  onFilter,
  onClose,
}: {
  type: string;
  options?: string[];
  active: { sort?: SortDir; enumFilter?: string[] };
  onSort: (dir: SortDir | null) => void;
  onFilter: (vals: string[] | null) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const [localFilter, setLocalFilter] = useState<string[]>(active.enumFilter ?? []);

  function toggleEnum(opt: string) {
    setLocalFilter((prev) =>
      prev.includes(opt) ? prev.filter((v) => v !== opt) : [...prev, opt]
    );
  }

  return (
    <div
      ref={ref}
      className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-neutral-900 border border-border dark:border-neutral-700 rounded-xl shadow-lg min-w-[140px] py-1 text-sm"
    >
      {(type === "text" || type === "date") && (
        <>
          <button
            onClick={() => { onSort("asc"); onClose(); }}
            className={`w-full flex items-center gap-2 px-3 py-1.5 hover:bg-surface-raised dark:hover:bg-neutral-800 transition cursor-pointer select-none ${active.sort === "asc" ? "text-brand-700" : "text-text-primary dark:text-neutral-200"}`}
          >
            <SortingUpIcon size={13} /> Ascending
          </button>
          <button
            onClick={() => { onSort("desc"); onClose(); }}
            className={`w-full flex items-center gap-2 px-3 py-1.5 hover:bg-surface-raised dark:hover:bg-neutral-800 transition cursor-pointer select-none ${active.sort === "desc" ? "text-brand-700" : "text-text-primary dark:text-neutral-200"}`}
          >
            <SortingDownIcon size={13} /> Descending
          </button>
          {active.sort && (
            <button
              onClick={() => { onSort(null); onClose(); }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-text-secondary hover:bg-surface-raised dark:hover:bg-neutral-800 transition cursor-pointer select-none"
            >
              <Cancel01Icon size={13} /> Clear sort
            </button>
          )}
        </>
      )}

      {type === "enum" && options && (
        <>
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => toggleEnum(opt)}
              className={`w-full flex items-center gap-2 px-3 py-1.5 hover:bg-surface-raised dark:hover:bg-neutral-800 transition cursor-pointer select-none ${localFilter.includes(opt) ? "text-brand-700 dark:text-brand-400" : "text-text-primary dark:text-neutral-200"}`}
            >
              <span className={`w-3 h-3 rounded-sm border-2 transition ${localFilter.includes(opt) ? "bg-brand-700 border-brand-700" : "border-border"}`} />
              {opt}
            </button>
          ))}
          <div className="h-px bg-border dark:bg-neutral-700 my-1" />
          <button
            onClick={() => { onFilter(localFilter.length > 0 ? localFilter : null); onClose(); }}
            className="w-full px-3 py-1.5 bg-brand-700 text-white text-xs font-semibold rounded-b-lg hover:bg-brand-800 transition cursor-pointer select-none"
          >
            Apply
          </button>
        </>
      )}
    </div>
  );
}

// ─── DataTable ────────────────────────────────────────────────────────────────

export default function DataTable<T extends { id: string }>({
  data,
  columns,
  loading,
  emptyMessage = "No data found.",
  rowHref,
}: {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  emptyMessage?: string;
  rowHref?: (row: T) => string;
}) {
  const [sorts, setSorts] = useState<Record<string, SortDir>>({});
  const [enumFilters, setEnumFilters] = useState<Record<string, string[]>>({});
  const [openFilter, setOpenFilter] = useState<string | null>(null);

  function handleSort(key: string, dir: SortDir | null) {
    setSorts((prev) => {
      const next = { ...prev };
      if (dir === null) delete next[key];
      else next[key] = dir;
      return next;
    });
  }

  function handleEnumFilter(key: string, vals: string[] | null) {
    setEnumFilters((prev) => {
      const next = { ...prev };
      if (!vals || vals.length === 0) delete next[key];
      else next[key] = vals;
      return next;
    });
  }

  let rows = [...data];

  // Apply enum filters
  for (const [key, vals] of Object.entries(enumFilters)) {
    rows = rows.filter((r) => vals.includes(String((r as Record<string, unknown>)[key])));
  }

  // Apply sorts (last sort key wins for simplicity)
  const sortEntries = Object.entries(sorts);
  if (sortEntries.length > 0) {
    const [key, dir] = sortEntries[sortEntries.length - 1];
    rows.sort((a, b) => {
      const av = String((a as Record<string, unknown>)[key] ?? "");
      const bv = String((b as Record<string, unknown>)[key] ?? "");
      return dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-border dark:border-neutral-800 overflow-hidden">
        <div className="flex items-center justify-center py-16 text-text-tertiary text-sm">Loading…</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-border dark:border-neutral-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-raised dark:bg-neutral-800 border-b border-border dark:border-neutral-700">
              {columns.map((col, ci) => {
                const key = "key" in col ? col.key : `col-${ci}`;
                const hasSort = col.sortable !== false && (col.type === "text" || col.type === "date");
                const hasFilter = col.type === "enum";
                const showFilterBtn = hasSort || hasFilter;

                return (
                  <th
                    key={key}
                    className="text-left px-4 py-3 font-semibold text-text-secondary dark:text-neutral-400 text-xs uppercase tracking-wide whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1">
                      <span>{col.label}</span>
                      {showFilterBtn && (
                        <div className="relative">
                          <button
                            onClick={() => setOpenFilter(openFilter === key ? null : key)}
                            className={`p-0.5 rounded hover:bg-surface-overlay dark:hover:bg-neutral-700 transition cursor-pointer select-none ${
                              sorts[key] || enumFilters[key] ? "text-brand-600" : "text-text-tertiary"
                            }`}
                          >
                            <FilterIcon size={11} />
                          </button>
                          {openFilter === key && (
                            <FilterMenu
                              type={col.type}
                              options={"options" in col ? col.options : undefined}
                              active={{ sort: sorts[key], enumFilter: enumFilters[key] }}
                              onSort={(dir) => handleSort(key, dir)}
                              onFilter={(vals) => handleEnumFilter(key, vals)}
                              onClose={() => setOpenFilter(null)}
                            />
                          )}
                        </div>
                      )}
                      {sorts[key] === "asc" && <SortingUpIcon size={11} className="text-brand-600" />}
                      {sorts[key] === "desc" && <SortingDownIcon size={11} className="text-brand-600" />}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border dark:divide-neutral-800">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-text-tertiary text-sm">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const href = rowHref?.(row);
                const RowWrapper = ({ children }: { children: React.ReactNode }) =>
                  href ? (
                    <tr className="hover:bg-surface-raised dark:hover:bg-neutral-800/60 transition group">
                      {children}
                    </tr>
                  ) : (
                    <tr className="hover:bg-surface-raised dark:hover:bg-neutral-800/60 transition">
                      {children}
                    </tr>
                  );

                return (
                  <RowWrapper key={row.id}>
                    {columns.map((col, ci) => {
                      const cellKey = `${row.id}-${ci}`;
                      const r = row as Record<string, unknown>;

                      if (col.type === "text") {
                        const content = (
                          <span className="text-text-primary dark:text-neutral-200">{String(r[col.key] ?? "—")}</span>
                        );
                        return (
                          <td key={cellKey} className="px-4 py-3 max-w-[200px] truncate">
                            {href && ci === 0 ? (
                              <Link href={href} className="hover:text-brand-700 transition">{content}</Link>
                            ) : content}
                          </td>
                        );
                      }

                      if (col.type === "user") {
                        return (
                          <td key={cellKey} className="px-4 py-3">
                            <UserCell
                              name={String(r[col.nameKey] ?? "")}
                              email={col.emailKey ? String(r[col.emailKey] ?? "") : undefined}
                              role={col.roleKey ? String(r[col.roleKey] ?? "") : undefined}
                              avatarUrl={col.avatarKey ? (r[col.avatarKey] as string | null) : undefined}
                              displayName={col.displayNameKey ? (r[col.displayNameKey] as string | null) : undefined}
                            />
                          </td>
                        );
                      }

                      if (col.type === "enum") {
                        return (
                          <td key={cellKey} className="px-4 py-3">
                            <EnumChip value={String(r[col.key] ?? "")} rowId={row.id} config={col.config} />
                          </td>
                        );
                      }

                      if (col.type === "date") {
                        const val = String(r[col.key] ?? "");
                        return (
                          <td key={cellKey} className="px-4 py-3">
                            <span
                              title={exactTime(val)}
                              className="text-text-secondary dark:text-neutral-400 text-xs cursor-default"
                            >
                              {relativeTime(val)}
                            </span>
                          </td>
                        );
                      }

                      if (col.type === "actions") {
                        return (
                          <td key={cellKey} className="px-4 py-3">
                            {col.render(row)}
                          </td>
                        );
                      }

                      return <td key={cellKey} className="px-4 py-3" />;
                    })}
                  </RowWrapper>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
