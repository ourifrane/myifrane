import Navbar from "@/components/Navbar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-surface-raised">
      <Navbar />
      <main className="flex-1 container mx-auto max-w-5xl px-4 py-8">
        {children}
      </main>
    </div>
  );
}
