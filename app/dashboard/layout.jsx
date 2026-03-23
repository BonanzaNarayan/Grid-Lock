import { DashboardNav } from "@/components/dashboard/DashboardNav";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* sidebar — desktop only */}
      <aside className="hidden md:flex">
        <DashboardNav />
      </aside>

      {/* main content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        {children}
      </main>

      {/* bottom bar — mobile only */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <DashboardNav mobile />
      </div>
    </div>
  );
}