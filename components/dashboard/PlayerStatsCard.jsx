"use client";
import { motion } from "motion/react";
import { useAuthStore } from "@/store/useAuthStore";

export function PlayerStatsCard() {
  const profile = useAuthStore((s) => s.profile);
  const stats   = profile?.stats?.["tic-tac-toe"] ?? { wins: 0, losses: 0, draws: 0 };
  const total   = stats.wins + stats.losses + stats.draws;
  const winRate = total ? Math.round((stats.wins / total) * 100) : 0;

  const items = [
    { label: "Wins",     value: stats.wins,   color: "text-primary"     },
    { label: "Losses",   value: stats.losses, color: "text-destructive"  },
    { label: "Draws",    value: stats.draws,  color: "text-muted-foreground" },
    { label: "Win Rate", value: `${winRate}%`, color: "text-accent-game" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative bg-card border border-border rounded-sm p-6 flex flex-col gap-4"
    >
      <span className="absolute top-0 left-6 right-6 h-px bg-primary opacity-20" />

      <div className="flex items-center justify-between">
        <h3 className="font-heading text-sm font-black tracking-widest text-foreground">
          YOUR STATS
        </h3>
        <span className="font-mono text-[10px] text-muted-foreground border border-border-game px-2 py-0.5 rounded-sm">
          TIC-TAC-TOE
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map(({ label, value, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.07 }}
            className="bg-background border border-border rounded-sm p-3 flex flex-col gap-1"
          >
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {label}
            </span>
            <span className={`font-heading text-2xl font-black ${color}`}>
              {value}
            </span>
          </motion.div>
        ))}
      </div>

      {/* win rate bar */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between">
          <span className="font-mono text-[10px] text-muted-foreground tracking-widest">
            WIN RATE
          </span>
          <span className="font-mono text-[10px] text-primary">{winRate}%</span>
        </div>
        <div className="h-1.5 bg-background rounded-full overflow-hidden border border-border">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${winRate}%` }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
          />
        </div>
      </div>
    </motion.div>
  );
}