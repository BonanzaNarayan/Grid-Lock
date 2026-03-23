"use client";
import { useEffect }         from "react";
import { useRouter }         from "next/navigation";
import { motion }            from "motion/react";
import { useAuthStore }      from "@/store/useAuthStore";
import { RoomsBrowser }      from "@/components/rooms/RoomsBrowser";

export default function DashboardRoomsPage() {
  const { user, loading } = useAuthStore();
  const router            = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [user, loading]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <motion.div
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 1.2, repeat: Infinity }}
        className="w-2 h-2 rounded-full bg-primary"
      />
    </div>
  );

  return (
    <div className="relative min-h-screen">
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, var(--primary) 2px, var(--primary) 3px)",
          backgroundSize: "100% 3px",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-6">

        {/* header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-black text-foreground tracking-tight">
              LIVE <span className="text-primary">ROOMS</span>
            </h1>
            <p className="font-mono text-xs text-muted-foreground tracking-widest mt-1">
              JOIN AN OPEN GAME OR QUICK JOIN A RANDOM ONE
            </p>
          </div>
        </div>

        {/* browser */}
        <RoomsBrowser showQuickJoin={true} showFilters={true} />

      </div>
    </div>
  );
}