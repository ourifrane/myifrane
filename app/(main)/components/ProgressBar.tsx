"use client";

export default function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full fixed top-0 left-0 right-0 z-50">
      <div className="bg-gray-200 dark:bg-neutral-700 h-4">
        <div
          className="h-4 rounded-full transition-all duration-1000 ease-in-out
                     bg-gradient-to-r from-green-400 via-green-500 to-green-600
                     shadow-[0_0_8px_rgba(34,197,94,0.7),0_0_12px_rgba(34,197,94,0.5)]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
