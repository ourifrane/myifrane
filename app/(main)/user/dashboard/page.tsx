"use client";

import { useState, useEffect, FormEvent } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import DataTable, { STATUS_CONFIG, ColumnDef } from "@/app/(main)/components/DataTable";
import MediaUpload from "@/app/(main)/components/MediaUpload";
import IssueSkeleton from "@/app/(main)/components/IssueSkeleton";
import { Add01Icon, Cancel01Icon, Location01Icon, Alert01Icon } from "hugeicons-react";

const MapView = dynamic(() => import("@/app/(main)/components/MapView"), { ssr: false });

const ISSUE_TYPES = [
  "Pothole", "Broken Streetlight", "Illegal Dumping",
  "Damaged Sidewalk", "Fallen Tree", "Graffiti", "Water Leak", "Other",
];

type IssueRow = {
  id: string;
  type: string;
  status: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  reportedBy: { name: string };
  assignedTo: { name: string } | null;
};

type FlatRow = {
  id: string;
  type: string;
  status: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  workerName: string;
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
  { type: "text", label: "Worker", key: "workerName" },
  { type: "date", label: "Reported", key: "createdAt", sortable: true },
];

export default function UserDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [issues, setIssues] = useState<IssueRow[]>([]);
  const [fetching, setFetching] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [locating, setLocating] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "USER") { router.replace("/"); return; }
    fetch("/api/issues").then((r) => r.json()).then(setIssues).finally(() => setFetching(false));
  }, [user, loading, router]);

  function detectLocation() {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocating(false); },
      () => { setLocating(false); setFormError("Location access denied."); }
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    if (!imageUrl) return setFormError("Please upload or take a photo.");
    if (!coords) return setFormError("Please detect your location.");

    const data = new FormData(e.currentTarget);
    setSubmitting(true);

    const res = await fetch("/api/issues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: data.get("type"),
        description: data.get("description"),
        imageUrl,
        latitude: coords.lat,
        longitude: coords.lng,
      }),
    });

    const json = await res.json();
    setSubmitting(false);
    if (!res.ok) return setFormError(json.error ?? "Failed to submit");
    setIssues((prev) => [json, ...prev]);
    setShowForm(false);
    setImageUrl("");
    setCoords(null);
    (e.target as HTMLFormElement).reset();
  }

  const rows: FlatRow[] = issues.map((i) => ({
    id: i.id,
    type: i.type,
    status: i.status,
    latitude: i.latitude,
    longitude: i.longitude,
    createdAt: i.createdAt,
    workerName: i.assignedTo?.name ?? "—",
  }));

  const mapPins = issues.map((i) => ({ id: i.id, lat: i.latitude, lng: i.longitude, status: i.status, type: i.type }));

  if (loading || fetching) return <IssueSkeleton rows={4} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-neutral-100">My Reports</h1>
          <p className="text-text-secondary text-sm mt-0.5">{issues.length} issue{issues.length !== 1 ? "s" : ""} submitted</p>
        </div>
        <button
          onClick={() => { setShowForm((s) => !s); setFormError(""); }}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl transition cursor-pointer select-none ${
            showForm ? "bg-surface-overlay text-text-secondary hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20" : "bg-brand-700 text-white hover:bg-brand-800"
          }`}
        >
          {showForm ? <><Cancel01Icon size={14} /> Cancel</> : <><Add01Icon size={14} /> Report issue</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-border dark:border-neutral-800 p-6 space-y-5">
          <h2 className="font-semibold text-text-primary dark:text-neutral-100 text-sm">New issue report</h2>
          {formError && (
            <p className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2.5">
              <Alert01Icon size={14} /> {formError}
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Issue type</label>
                <select name="type" required className="w-full border border-border dark:border-neutral-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-brand-500 transition">
                  {ISSUE_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Location</label>
                <button
                  type="button"
                  onClick={detectLocation}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 border rounded-xl text-sm transition cursor-pointer select-none ${
                    coords ? "border-brand-400 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400" : "border-border dark:border-neutral-700 text-text-secondary hover:border-brand-400"
                  }`}
                >
                  {locating ? <div className="w-3.5 h-3.5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" /> : <Location01Icon size={14} />}
                  {locating ? "Detecting…" : coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : "Detect my location"}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Description</label>
              <textarea name="description" required rows={3} placeholder="Describe the issue…" className="w-full border border-border dark:border-neutral-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition resize-none placeholder:text-text-tertiary bg-white dark:bg-neutral-800 dark:text-neutral-100" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Photo</label>
              <MediaUpload onUploaded={(url) => setImageUrl(url)} />
            </div>
            <button type="submit" disabled={submitting} className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-700 text-white text-sm font-semibold rounded-xl hover:bg-brand-800 transition cursor-pointer select-none disabled:opacity-60">
              {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Add01Icon size={15} />}
              {submitting ? "Submitting…" : "Submit report"}
            </button>
          </form>
        </div>
      )}

      <MapView issues={mapPins} />

      <DataTable
        data={rows}
        columns={COLUMNS}
        loading={false}
        emptyMessage="No reports yet. Hit 'Report issue' to get started."
        rowHref={(row) => `/issues/${row.id}`}
      />
    </div>
  );
}
