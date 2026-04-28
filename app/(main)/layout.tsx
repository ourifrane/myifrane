import Sidebar from "@/app/(main)/components/Sidebar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-surface-raised dark:bg-neutral-950">
      <Sidebar />
      {/* Sidebar takes 56px collapsed. Main content shifts with CSS var set by sidebar hover */}
      <main className="flex-1 min-w-0 pl-14">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
