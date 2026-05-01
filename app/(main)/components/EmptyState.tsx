import type { ReactNode } from "react";

export default function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 px-6 text-center text-text-secondary dark:text-neutral-400">
      <div className="flex items-center justify-center w-24 h-24 rounded-3xl bg-brand-100/80 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
        <svg viewBox="0 0 76 76" className="w-12 h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="11" y="14" width="54" height="48" rx="10" fill="currentColor" fillOpacity="0.12" />
          <path d="M24 22H52" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <path d="M24 32H52" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <path d="M24 42H38" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <circle cx="48" cy="52" r="8" fill="currentColor" fillOpacity="0.2" />
          <path d="M52 48L58 54" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <path d="M56 44L58 46" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
      <div className="space-y-2 max-w-xs">
        <h3 className="text-lg font-semibold text-text-primary dark:text-neutral-100">{title}</h3>
        {description ? <p className="text-sm leading-relaxed text-text-secondary dark:text-neutral-400">{description}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
