import { Clock, Wrench, CheckCircle, XCircle, Circle } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; cls: string }> = {
  OPEN:      { label: "Open",      icon: Circle,       cls: "bg-blue-50 text-blue-600 border-blue-200" },
  ASSIGNED:  { label: "Assigned",  icon: Wrench,       cls: "bg-amber-50 text-amber-600 border-amber-200" },
  COMPLETED: { label: "Completed", icon: CheckCircle,  cls: "bg-brand-50 text-brand-700 border-brand-200" },
  CANCELLED: { label: "Cancelled", icon: XCircle,      cls: "bg-gray-50 text-gray-400 border-gray-200" },
};

export default function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.OPEN;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.cls}`}>
      <Icon size={10} />
      {cfg.label}
    </span>
  );
}
