"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
import Image from "next/image";
import { ArrowRightBigIcon, Location01Icon, Wrench01Icon, ShieldUserIcon, CheckmarkCircle01Icon } from "hugeicons-react";

const STATS = [
  { value: "2,400+", label: "Issues resolved" },
  { value: "180",    label: "Active workers" },
  { value: "4.8s",   label: "Avg. response time" },
  { value: "99%",    label: "City coverage" },
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
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Subtle panoramic background */}
      <div className="fixed inset-0 -z-10">
        <Image
          src="/ifrane.png"
          alt="Ifrane"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-white/95 dark:bg-neutral-950/95" />
      </div>

      {/* Minimal nav */}
      <nav className="flex items-center justify-between px-8 py-5">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-brand-800 dark:text-brand-400 text-lg">
          <Image src="/favicon.png" width={32} height={32} alt="MyIfrane" className="w-8 h-8" />
          MyIfrane
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-semibold text-text-secondary hover:text-text-primary dark:text-neutral-400 dark:hover:text-neutral-100 transition cursor-pointer select-none"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="flex items-center gap-2 px-5 py-2 bg-brand-700 text-white text-sm font-semibold rounded-xl hover:bg-brand-800 transition cursor-pointer select-none"
          >
            Get started <ArrowRightBigIcon size={14} />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-8 pb-20 gap-8">
        <div className="space-y-5 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 border border-brand-200 dark:border-brand-800 px-3 py-1.5 rounded-full uppercase tracking-widest">
            <Location01Icon size={11} />
            Ifrane, Morocco
          </span>

          <h1 className="text-6xl font-bold text-text-primary dark:text-neutral-50 leading-[1.08] tracking-tight">
            Your city.<br />
            <span className="text-brand-700 dark:text-brand-400">Your voice.</span><br />
            Our fix.
          </h1>

          <p className="text-text-secondary dark:text-neutral-400 text-lg leading-relaxed max-w-lg mx-auto">
            Spot a pothole? Broken streetlight? A fallen tree? Report it in 10 seconds.
            Workers are notified instantly.
          </p>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/register"
              className="flex items-center gap-2 px-7 py-3.5 bg-brand-700 text-white text-sm font-semibold rounded-xl hover:bg-brand-800 transition shadow-lg shadow-brand-700/20 cursor-pointer select-none"
            >
              Report an issue <ArrowRightBigIcon size={15} />
            </Link>
            <Link
              href="/login"
              className="px-7 py-3.5 border-2 border-border dark:border-neutral-700 text-text-primary dark:text-neutral-200 text-sm font-semibold rounded-xl hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition cursor-pointer select-none"
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* Stats band */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border dark:bg-neutral-700 border border-border dark:border-neutral-700 rounded-2xl overflow-hidden w-full max-w-2xl mt-4 shadow-sm">
          {STATS.map(({ value, label }) => (
            <div key={label} className="bg-white dark:bg-neutral-900 px-6 py-5 text-center">
              <p className="text-2xl font-bold text-brand-700 dark:text-brand-400">{value}</p>
              <p className="text-xs text-text-secondary dark:text-neutral-400 mt-0.5 font-medium">{label}</p>
            </div>
          ))}
        </div>

        {/* How it works — timeline style */}
        <div className="w-full max-w-2xl mt-12 text-left">
          <p className="text-sm font-semibold text-text-tertiary dark:text-neutral-500 uppercase tracking-widest mb-8 text-center">How it works</p>
          <div className="relative">
            <div className="absolute left-6 top-6 bottom-6 w-px bg-border dark:bg-neutral-700" />
            {[
              { icon: Location01Icon, color: "text-blue-600 bg-blue-50 dark:bg-blue-900/30", title: "You spot a problem", desc: "Take a photo, drop your location. Done in 10 seconds." },
              { icon: Wrench01Icon,   color: "text-amber-600 bg-amber-50 dark:bg-amber-900/30", title: "A worker picks it up", desc: "Approved city workers self-assign and head to the scene." },
              { icon: CheckmarkCircle01Icon, color: "text-brand-700 bg-brand-50 dark:bg-brand-900/30", title: "Fixed & closed", desc: "Worker uploads proof. Issue marked resolved. Points rewarded." },
              { icon: ShieldUserIcon, color: "text-purple-600 bg-purple-50 dark:bg-purple-900/30", title: "Admins keep watch", desc: "Real-time dashboard. Rewards top workers. Full accountability." },
            ].map(({ icon: Icon, color, title, desc }, i) => (
              <div key={i} className="flex items-start gap-5 mb-8 last:mb-0">
                <div className={`w-12 h-12 rounded-xl ${color.split(" ").slice(1).join(" ")} flex items-center justify-center shrink-0 relative z-10`}>
                  <Icon size={22} className={color.split(" ")[0]} />
                </div>
                <div className="pt-2">
                  <p className="font-semibold text-text-primary dark:text-neutral-100 text-base">{title}</p>
                  <p className="text-text-secondary dark:text-neutral-400 text-sm mt-1 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA footer strip */}
        <div className="w-full max-w-2xl bg-brand-700 dark:bg-brand-800 rounded-2xl p-8 text-center text-white mt-4">
          <p className="text-xl font-bold mb-2">Ifrane deserves better.</p>
          <p className="text-brand-200 text-sm mb-5">Join the citizens already making a difference.</p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-brand-800 text-sm font-bold rounded-xl hover:bg-brand-50 transition cursor-pointer select-none"
          >
            Join for free <ArrowRightBigIcon size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
