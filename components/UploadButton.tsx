"use client";

import { useState, ChangeEvent } from "react";
import Image from "next/image";
import { Camera, Loader2, CheckCircle, AlertCircle } from "lucide-react";

type Props = {
  onUploaded: (url: string) => void;
};

export default function UploadButton({ onUploaded }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

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

  return (
    <div className="space-y-2">
      <label className={`flex items-center gap-3 border-2 border-dashed rounded-xl px-4 py-4 cursor-pointer transition ${
        done ? "border-brand-400 bg-brand-50" : "border-border hover:border-brand-400"
      }`}>
        {uploading ? (
          <Loader2 size={18} className="text-text-secondary animate-spin" />
        ) : done ? (
          <CheckCircle size={18} className="text-brand-600" />
        ) : (
          <Camera size={18} className="text-text-secondary" />
        )}
        <span className="text-sm text-text-secondary">
          {uploading ? "Uploading…" : done ? "Photo uploaded — click to replace" : "Click to upload a photo"}
        </span>
        <input type="file" accept="image/*" className="hidden" onChange={handleChange} />
      </label>

      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-600">
          <AlertCircle size={12} /> {error}
        </p>
      )}

      {preview && (
        <div className="relative h-40 w-full rounded-xl overflow-hidden border border-border">
          <Image src={preview} alt="Preview" fill className="object-cover" />
          {uploading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <Loader2 size={20} className="text-brand-700 animate-spin" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
