"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Camera01Icon, Cancel01Icon, CheckmarkCircle01Icon, ArrowReloadHorizontalIcon } from "hugeicons-react";

type Props = {
  onCapture: (file: File) => void;
  onClose: () => void;
};

export default function WebcamCapture({ onCapture, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [captured, setCaptured] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch {
      setError("Could not access camera. Please allow camera permissions.");
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  function capture() {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")!.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setCaptured(dataUrl);
    stopCamera();
  }

  function retake() {
    setCaptured(null);
    setError("");
    startCamera();
  }

  async function confirm() {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" });
      onCapture(file);
      onClose();
    }, "image/jpeg", 0.9);
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border dark:border-neutral-700">
          <h3 className="font-semibold text-text-primary dark:text-neutral-100 text-sm flex items-center gap-2">
            <Camera01Icon size={16} /> Take a photo
          </h3>
          <button onClick={onClose} className="text-text-secondary hover:text-red-500 transition cursor-pointer select-none">
            <Cancel01Icon size={18} />
          </button>
        </div>

        <div className="relative bg-black" style={{ aspectRatio: "4/3" }}>
          {error && (
            <div className="absolute inset-0 flex items-center justify-center text-white text-sm text-center px-6">
              {error}
            </div>
          )}
          {!captured ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <Image src={captured} alt="Captured" fill className="object-cover" />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex gap-3 p-4">
          {!captured ? (
            <>
              <button
                onClick={onClose}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-border text-text-secondary text-sm font-semibold rounded-lg hover:bg-surface-overlay transition cursor-pointer select-none"
              >
                <Cancel01Icon size={14} /> Cancel
              </button>
              <button
                onClick={capture}
                disabled={!!error}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-brand-700 text-white text-sm font-semibold rounded-lg hover:bg-brand-800 transition disabled:opacity-60 cursor-pointer select-none"
              >
                <Camera01Icon size={14} /> Capture
              </button>
            </>
          ) : (
            <>
              <button
                onClick={retake}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-border text-text-secondary text-sm font-semibold rounded-lg hover:bg-surface-overlay transition cursor-pointer select-none"
              >
                <ArrowReloadHorizontalIcon size={14} /> Retake
              </button>
              <button
                onClick={confirm}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-brand-700 text-white text-sm font-semibold rounded-lg hover:bg-brand-800 transition cursor-pointer select-none"
              >
                <CheckmarkCircle01Icon size={14} /> Use this photo
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
