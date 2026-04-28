"use client";

import { useState, ChangeEvent } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Camera01Icon, Upload01Icon, CheckmarkCircle01Icon, Alert01Icon, ArrowReloadHorizontalIcon } from "hugeicons-react";

const WebcamCapture = dynamic(() => import("./WebcamCapture"), { ssr: false });

type Props = {
  onUploaded: (url: string) => void;
  label?: string;
};

export default function MediaUpload({ onUploaded, label }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [showWebcam, setShowWebcam] = useState(false);

  async function uploadFile(file: File) {
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    setDone(false);
    setError("");

    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: form });
    const json = await res.json();
    setUploading(false);

    if (!res.ok) return setError(json.error ?? "Upload failed");
    setDone(true);
    onUploaded(json.url);
  }

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
  }

  async function handleWebcamCapture(file: File) {
    await uploadFile(file);
  }

  function reset() {
    setPreview(null);
    setDone(false);
    setError("");
    onUploaded("");
  }

  return (
    <div className="space-y-2">
      {showWebcam && (
        <WebcamCapture
          onCapture={handleWebcamCapture}
          onClose={() => setShowWebcam(false)}
        />
      )}

      <div className="flex gap-2">
        <label className={`flex-1 flex items-center gap-2.5 border-2 border-dashed rounded-xl px-4 py-3 cursor-pointer transition select-none ${
          done ? "border-brand-400 bg-brand-50 dark:bg-brand-900/20" : "border-border hover:border-brand-400 dark:border-neutral-600 dark:hover:border-brand-500"
        }`}>
          {uploading ? (
            <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          ) : done ? (
            <CheckmarkCircle01Icon size={18} className="text-brand-600 shrink-0" />
          ) : (
            <Upload01Icon size={18} className="text-text-secondary shrink-0" />
          )}
          <span className="text-sm text-text-secondary dark:text-neutral-400">
            {uploading ? "Uploading…" : done ? (label ? `${label} uploaded` : "Photo uploaded") : `Upload ${label ?? "photo"}`}
          </span>
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
        </label>

        <button
          type="button"
          onClick={() => setShowWebcam(true)}
          className="flex items-center gap-2 px-3 py-2.5 border-2 border-dashed border-border dark:border-neutral-600 rounded-xl hover:border-brand-400 transition text-text-secondary dark:text-neutral-400 cursor-pointer select-none"
          title="Use webcam"
        >
          <Camera01Icon size={18} />
        </button>

        {done && (
          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-2 px-3 py-2.5 border border-border dark:border-neutral-600 rounded-xl hover:bg-surface-overlay transition text-text-secondary cursor-pointer select-none"
            title="Remove photo"
          >
            <ArrowReloadHorizontalIcon size={16} />
          </button>
        )}
      </div>

      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-600">
          <Alert01Icon size={12} /> {error}
        </p>
      )}

      {preview && (
        <div className="relative h-40 w-full rounded-xl overflow-hidden border border-border dark:border-neutral-700">
          <Image src={preview} alt="Preview" fill className="object-cover" />
          {uploading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-brand-700 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
