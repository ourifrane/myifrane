"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import DataTable, { STATUS_CONFIG, ColumnDef } from "@/app/(main)/components/DataTable";
import IssueSkeleton from "@/app/(main)/components/IssueSkeleton";
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
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<"open" | "mine">("open");

  const fetchIssues = async () => {
    setFetching(true);
    try {
      const response = await fetch("/api/issues");
      const data = await response.json();
      setIssues(data);
    } finally {
      setFetching(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "WORKER") { router.replace("/"); return; }
    fetchIssues();
  }, [user, loading, router]);

  if (loading || fetching) return <IssueSkeleton rows={4} />;

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

  const list = tab === "open" ? openIssues : myIssues;

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-neutral-100">Worker Dashboard</h1>
          <p className="text-text-secondary text-sm mt-0.5">
            {openIssues.length} open · {myIssues.filter((i) => i.status === "ASSIGNED").length} assigned · {completedByMe.length} completed by you
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setRefreshing(true); fetchIssues(); }}
          disabled={fetching}
          className="inline-flex items-center justify-center rounded-xl border border-border bg-surface-raised px-4 py-2 text-sm font-medium text-text-primary transition hover:border-text-primary hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950"
        >
          {refreshing ? "Refreshing…" : "Refresh issues"}
        </button>
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

      <DataTable
        data={rows}
        columns={COLUMNS}
        loading={false}
        emptyMessage={tab === "open" ? "No open issues right now." : "You haven't taken any issues yet."}
        rowHref={(row) => `/issues/${row.id}`}
      />
    </div>
  );
}
