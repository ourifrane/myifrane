"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
import { MapPin, Wrench, ShieldCheck, ArrowRight } from "lucide-react";

const FEATURES = [
  {
    icon: MapPin,
    title: "Report Issues",
    desc: "Submit problems with a photo and your live location in seconds.",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    icon: Wrench,
    title: "Workers Resolve",
    desc: "Approved workers self-assign and mark issues as completed.",
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
  {
    icon: ShieldCheck,
    title: "Admin Oversight",
    desc: "Admins manage workers, monitor all issues, and keep things moving.",
    color: "text-brand-600",
    bg: "bg-brand-50",
  },
];

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || !user) return;
    if (user.role === "ADMIN") router.replace("/admin/dashboard");
    else if (user.role === "WORKER") router.replace("/worker/dashboard");
    else router.replace("/user/dashboard");
  }, [user, loading, router]);

  if (loading || user) return null;

  return (
    <div className="flex flex-col items-center text-center pt-16 pb-24 gap-12">
      {/* Hero */}
      <div className="space-y-5 max-w-lg">
        <span className="inline-block text-xs font-semibold text-brand-700 bg-brand-100 px-3 py-1 rounded-full uppercase tracking-widest">
          Ifrane, Morocco
        </span>
        <h1 className="text-5xl font-bold text-text-primary leading-tight tracking-tight">
          A cleaner city<br />
          <span className="text-brand-700">starts here.</span>
        </h1>
        <p className="text-text-secondary text-lg leading-relaxed">
          Spot a problem? Report it. We connect citizens with workers to resolve public issues fast.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/register"
            className="flex items-center gap-2 px-6 py-3 bg-brand-700 text-white text-sm font-semibold rounded-lg hover:bg-brand-800 transition"
          >
            Get started <ArrowRight size={15} />
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 border border-border text-text-primary text-sm font-semibold rounded-lg hover:bg-white transition"
          >
            Sign in
          </Link>
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl text-left">
        {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
          <div key={title} className="bg-white rounded-xl p-5 border border-border shadow-sm hover:shadow-md transition">
            <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <h3 className="font-semibold text-text-primary text-sm">{title}</h3>
            <p className="text-text-secondary text-xs mt-1 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
