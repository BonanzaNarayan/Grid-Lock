"use client";
import { useState, useEffect }     from "react";
import { useRouter }               from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useAuthStore }            from "@/store/useAuthStore";
import { StatsTabs }               from "@/components/stats/StatsTabs";
import { OverallStats }            from "@/components/stats/OverallStats";
import { GameTypeStats }           from "@/components/stats/GameTypeStats";
import { WinRateChart }            from "@/components/stats/WinRateChart";
import { StreakCard }               from "@/components/stats/StreakCard";
import { Leaderboard }             from "@/components/stats/Leaderboard";

export default function StatsPage() {
  const { user, loading } = useAuthStore();
  const router            = useRouter();
  const [tab, setTab]     = useState("stats");

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

      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-6">

        {/* heading */}
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-black text-foreground tracking-tight">
            STATS &amp; LEADERBOARD
          </h1>
          <p className="font-mono text-xs text-muted-foreground tracking-widest mt-1">
            TRACK YOUR PROGRESS. DOMINATE THE BOARD.
          </p>
        </div>

        {/* card */}
        <div className="relative bg-card border border-border rounded-sm overflow-hidden">
          <span className="absolute top-0 left-6 right-6 h-px bg-primary opacity-20" />

          <StatsTabs active={tab} onChange={setTab} />

          <div className="p-6 md:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 8  }}
                animate={{ opacity: 1, y: 0  }}
                exit={{   opacity: 0, y: -8  }}
                transition={{ duration: 0.2 }}
              >
                {tab === "stats" && (
                  <div className="flex flex-col gap-10">
                    <OverallStats />
                    <div className="h-px bg-border" />
                    <StreakCard />
                    <div className="h-px bg-border" />
                    <WinRateChart />
                    <div className="h-px bg-border" />
                    <GameTypeStats />
                  </div>
                )}
                {tab === "leaderboard" && (
                  <Leaderboard />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}