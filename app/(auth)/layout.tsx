import { CheckIcon, MapPin, WrenchIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between bg-brand-800 p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-[-20%] right-[-20%] w-[600px] h-[600px] rounded-full bg-white" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-white" />
        </div>

        <Link href="/" className="relative z-10 flex items-center gap-1">
          <Image src="/favicon.png" width={500} height={500} alt="MyIfrane Icon" className="size-[3em]" />
          <span className="text-2xl font-bold text-white tracking-tight">MyIfrane</span>
        </Link>

        <div className="relative z-10 space-y-6">
          <p className="text-brand-100 text-sm font-medium uppercase tracking-widest">
            Community Crowd-Sourcing Platform
          </p>
          <h2 className="text-4xl font-bold text-white leading-tight">
            Making Ifrane<br />better, together.
          </h2>
          <p className="text-brand-200 text-base leading-relaxed max-w-sm">
            Report public issues, track resolutions, and help keep our city clean and safe.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { icon: MapPin, label: "Report Issues" },
            { icon: WrenchIcon, label: "Track Progress" },
            { icon: CheckIcon, label: "Get Resolved" },
          ].map(({ icon:Icon, label }) => (
            <div key={label} className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm flex flex-col justify-center items-center">
              <div className="text-xl mb-1 text-white"><Icon/></div>
              <div className="text-xs text-brand-100 font-medium">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden flex items-center gap-2 mb-8">
            <img src="/favicon.png" alt="MyIfrane Icon" className="w-5 h-5" />
            <span className="text-xl font-bold text-brand-800">MyIfrane</span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
