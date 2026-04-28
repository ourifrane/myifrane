"use client";

import { useState, useEffect, FormEvent } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import IssueCard, { IssueSummary } from "@/components/IssueCard";
import UploadButton from "@/components/UploadButton";
import { Plus, X, MapPin, Loader2 } from "lucide-react";

const ISSUE_TYPES = [
  "Pothole", "Broken Streetlight", "Illegal Dumping",
  "Damaged Sidewalk", "Fallen Tree", "Graffiti", "Water Leak", "Other",
];

function EmptyState({ onReport }: { onReport: () => void }) {
  return (
    <div className="text-center py-20">
      <div className="w-16 h-16 bg-surface-overlay rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Plus size={28} className="text-text-tertiary" />
      </div>
      <h3 className="font-semibold text-text-primary">No reports yet</h3>
      <p className="text-text-secondary text-sm mt-1 mb-5">Be the first to report an issue in your area.</p>
      <button
        onClick={onReport}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-700 text-white text-sm font-semibold rounded-lg hover:bg-brand-800 transition"
      >
        <Plus size={15} /> Report an issue
      </button>
    </div>
  );
}

export default function UserDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [issues, setIssues] = useState<IssueSummary[]>([]);
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

    fetch("/api/issues")
      .then((r) => r.json())
      .then(setIssues)
      .finally(() => setFetching(false));
  }, [user, loading, router]);

  function detectLocation() {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocating(false); },
      () => { setLocating(false); setFormError("Location access denied. Please enable it in your browser."); }
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    if (!imageUrl) return setFormError("Please upload a photo first.");
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

  if (loading || fetching) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-text-tertiary" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">My Reports</h1>
          <p className="text-text-secondary text-sm mt-0.5">{issues.length} issue{issues.length !== 1 ? "s" : ""} submitted</p>
        </div>
        <button
          onClick={() => { setShowForm((s) => !s); setFormError(""); }}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg transition ${
            showForm
              ? "bg-surface-overlay text-text-secondary hover:bg-red-50 hover:text-red-600"
              : "bg-brand-700 text-white hover:bg-brand-800"
          }`}
        >
          {showForm ? <><X size={14} /> Cancel</> : <><Plus size={14} /> Report issue</>}
        </button>
      </div>

      {/* Report form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-border p-6 space-y-5">
          <h2 className="font-semibold text-text-primary text-sm">New issue report</h2>

          {formError && (
            <p className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
              <span>⚠</span> {formError}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Issue type</label>
                <select
                  name="type"
                  required
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
                >
                  {ISSUE_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Location</label>
                <button
                  type="button"
                  onClick={detectLocation}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 border rounded-lg text-sm transition ${
                    coords
                      ? "border-brand-400 bg-brand-50 text-brand-700"
                      : "border-border text-text-secondary hover:border-brand-400"
                  }`}
                >
                  {locating ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />}
                  {locating ? "Detecting…" : coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : "Detect my location"}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Description</label>
              <textarea
                name="description"
                required
                rows={3}
                placeholder="Describe the issue in detail…"
                className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition resize-none placeholder:text-text-tertiary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Photo</label>
              <UploadButton onUploaded={setImageUrl} />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-700 text-white text-sm font-semibold rounded-lg hover:bg-brand-800 transition disabled:opacity-60"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
              {submitting ? "Submitting…" : "Submit report"}
            </button>
          </form>
        </div>
      )}

      {/* Issues list */}
      {issues.length === 0 && !showForm ? (
        <EmptyState onReport={() => setShowForm(true)} />
      ) : (
        <div className="space-y-2.5">
          {issues.map((issue) => <IssueCard key={issue.id} issue={issue} />)}
        </div>
      )}
    </div>
  );
}
