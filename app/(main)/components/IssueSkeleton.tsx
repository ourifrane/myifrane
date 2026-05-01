export default function IssueSkeleton({
  rows = 4,
  variant = "card",
}: {
  rows?: number;
  variant?: "card" | "table";
}) {
  const items = Array.from({ length: rows });
  if (variant === "table") {
    return (
      <div className="space-y-3 px-4 py-4">
        {items.map((_, index) => (
          <div key={index} className="grid grid-cols-[1.4fr_1fr_0.8fr_0.7fr] gap-4 items-center rounded-3xl border border-border bg-surface-raised dark:border-neutral-800 dark:bg-neutral-900 p-4 animate-pulse">
            <div className="h-4 rounded-full bg-surface-overlay dark:bg-neutral-800 col-span-1" />
            <div className="h-4 rounded-full bg-surface-overlay dark:bg-neutral-800 col-span-1" />
            <div className="h-4 rounded-full bg-surface-overlay dark:bg-neutral-800 col-span-1" />
            <div className="h-4 rounded-full bg-surface-overlay dark:bg-neutral-800 col-span-1" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-pulse">
      {items.map((_, index) => (
        <div key={index} className="rounded-3xl border border-border bg-white dark:border-neutral-800 dark:bg-neutral-900 p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-3xl bg-surface-overlay dark:bg-neutral-800" />
            <div className="grow space-y-2">
              <div className="h-4 w-3/5 rounded-full bg-surface-overlay dark:bg-neutral-800" />
              <div className="h-3 w-2/5 rounded-full bg-surface-overlay dark:bg-neutral-800" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="h-3 rounded-full bg-surface-overlay dark:bg-neutral-800" />
            <div className="h-3 rounded-full bg-surface-overlay dark:bg-neutral-800" />
            <div className="h-3 rounded-full bg-surface-overlay dark:bg-neutral-800" />
          </div>
        </div>
      ))}
    </div>
  );
}
