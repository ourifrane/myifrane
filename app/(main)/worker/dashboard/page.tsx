"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import DataTable, { STATUS_CONFIG, ColumnDef } from "@/app/(main)/components/DataTable";
import { Clock01Icon, Alert01Icon, CheckmarkCircle01Icon, Wrench01Icon } from "hugeicons-react";

const MapView = dynamic(() => import("@/app/(main)/components/MapView"), { ssr: false });

type IssueRow = {
  id: string;
  type: string;
  status: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
  reportedBy: { name: string; displayName?: string | null };
  assignedTo: { id: string; name: string } | null;
};

type FlatRow = {
  id: string;
  type: string;
  status: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  reporterName: string;
};

const STATUS_FILTERS = ["ALL", "ASSIGNED", "COMPLETED", "CANCELLED"] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number];

const COLUMNS: ColumnDef<FlatRow>[] = [
  { type: "text", label: "Issue", key: "type", sortable: true },
  {
    type: "enum",
    label: "Status",
    key: "status",
    config: STATUS_CONFIG,
    options: ["OPEN", "ASSIGNED", "COMPLETED", "CANCELLED"],
  },
  { type: "text", label: "Reported by", key: "reporterName" },
  { type: "date", label: "Date", key: "createdAt", sortable: true },
];

export default function WorkerDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [issues, setIssues] = useState<IssueRow[]>([]);
  const [fetching, setFetching] = useState(true);
  const [tab, setTab] = useState<"open" | "mine">("open");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "WORKER") { router.replace("/"); return; }

    setFetching(true);
    const query = tab === "open" ? "?status=OPEN" : statusFilter === "ALL" ? "" : `?status=${statusFilter}`;

    fetch(`/api/issues${query}`)
      .then((r) => r.json())
      .then(setIssues)
      .finally(() => setFetching(false));
  }, [user, loading, router, tab, statusFilter]);

  if (loading || fetching) return (
    <div className="flex items-center justify-center py-20 text-text-tertiary text-sm">Loading…</div>
  );

  if (!user?.approved) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
        <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center">
          <Clock01Icon size={28} className="text-amber-500" />
        </div>
        <div>
          <h2 className="font-bold text-text-primary dark:text-neutral-100 text-lg">Awaiting approval</h2>
          <p className="text-text-secondary text-sm mt-1 max-w-xs">
            An admin needs to approve your worker account before you can take on issues.
          </p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-2 text-sm text-amber-700 dark:text-amber-400 font-medium">
          Account status: <span className="font-bold">Pending review</span>
        </div>
      </div>
    );
  }

  const openIssues = issues.filter((i) => i.status === "OPEN");
  const myIssues = issues.filter((i) => i.assignedTo?.id === user?.id);
  const completedByMe = myIssues.filter((i) => i.status === "COMPLETED");
  const filteredMine = statusFilter === "ALL" ? myIssues : myIssues.filter((i) => i.status === statusFilter);

  const list = tab === "open" ? openIssues : filteredMine;

  const rows: FlatRow[] = list.map((i) => ({
    id: i.id,
    type: i.type,
    status: i.status,
    latitude: i.latitude,
    longitude: i.longitude,
    createdAt: i.createdAt,
    reporterName: i.reportedBy.displayName || i.reportedBy.name,
  }));

  const mapPins = issues.map((i) => ({ id: i.id, lat: i.latitude, lng: i.longitude, status: i.status, type: i.type }));

  const TABS = [
    { value: "open" as const, label: "Open issues", count: openIssues.length, icon: Alert01Icon },
    { value: "mine" as const, label: "My issues", count: myIssues.length, icon: Wrench01Icon },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary dark:text-neutral-100">Worker Dashboard</h1>
        <p className="text-text-secondary text-sm mt-0.5">
          {openIssues.length} open · {myIssues.filter((i) => i.status === "ASSIGNED").length} assigned · {completedByMe.length} completed by you
        </p>
      </div>

      {/* Stat pills */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl px-4 py-3 text-center">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{openIssues.length}</p>
          <p className="text-xs text-blue-400 font-medium mt-0.5">Open</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl px-4 py-3 text-center">
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{myIssues.filter((i) => i.status === "ASSIGNED").length}</p>
          <p className="text-xs text-amber-400 font-medium mt-0.5">Assigned to me</p>
        </div>
        <div className="bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800 rounded-xl px-4 py-3 text-center">
          <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">{completedByMe.length}</p>
          <p className="text-xs text-brand-400 font-medium mt-0.5">Completed</p>
        </div>
      </div>

      <MapView issues={mapPins} />

      {/* Tabs */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="flex border-b border-border dark:border-neutral-800">
          {TABS.map(({ value, label, count, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition cursor-pointer select-none ${
                tab === value ? "border-brand-700 text-brand-700 dark:text-brand-400" : "border-transparent text-text-secondary hover:text-text-primary dark:hover:text-neutral-100"
              }`}
            >
              <Icon size={14} />
              {label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${tab === value ? "bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-400" : "bg-surface-overlay dark:bg-neutral-800 text-text-tertiary"}`}>
                {count}
              </span>
            </button>
          ))}
        </div>

        {tab === "mine" && (
          <div className="flex items-center gap-3 text-sm text-text-secondary">
            <label htmlFor="statusFilter" className="font-medium text-text-primary dark:text-neutral-200">Show</label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              className="rounded-xl border border-border dark:border-neutral-700 bg-white dark:bg-neutral-900 text-text-primary dark:text-neutral-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
            >
              {STATUS_FILTERS.map((filter) => (
                <option key={filter} value={filter}>
                  {filter === "ALL" ? "All my issues" : filter.charAt(0) + filter.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <DataTable
        data={rows}
        columns={COLUMNS}
        loading={false}
        emptyMessage={tab === "open" ? "No open issues right now." : statusFilter === "ALL" ? "You haven't taken any issues yet." : `No ${statusFilter.toLowerCase()} issues found.`}
        rowHref={(row) => `/issues/${row.id}`}
      />
    </div>
  );
}
