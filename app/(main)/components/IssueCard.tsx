import Link from "next/link";
import Image from "next/image";
import StatusBadge from "@/app/(main)/components/StatusBadge";
import { MapPin, CalendarDays } from "lucide-react";

export type IssueSummary = {
  id: string;
  type: string;
  description: string;
  imageUrl: string;
  status: string;
  createdAt: string;
  reportedBy: { name: string };
  assignedTo?: { name: string } | null;
};

export default function IssueCard({ issue }: { issue: IssueSummary }) {
  return (
    <Link href={`/issues/${issue.id}`} className="group block">
      <div className="bg-white rounded-xl border border-border hover:border-border-strong hover:shadow-md transition-all overflow-hidden flex">
        {/* Image */}
        <div className="relative w-24 sm:w-32 shrink-0">
          <Image
            src={issue.imageUrl}
            alt={issue.type}
            fill
            className="object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex flex-col justify-between p-4 flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-text-primary text-sm truncate group-hover:text-brand-700 transition">
                {issue.type}
              </p>
              <p className="text-xs text-text-secondary mt-0.5 line-clamp-2 leading-relaxed">
                {issue.description}
              </p>
            </div>
            <StatusBadge status={issue.status} />
          </div>

          <div className="flex items-center gap-4 mt-3 text-xs text-text-tertiary">
            <span className="flex items-center gap-1">
              <MapPin size={10} />
              {issue.reportedBy.name}
            </span>
            <span className="flex items-center gap-1">
              <CalendarDays size={10} />
              {new Date(issue.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </span>
            {issue.assignedTo && (
              <span className="text-amber-600 font-medium">→ {issue.assignedTo.name}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
