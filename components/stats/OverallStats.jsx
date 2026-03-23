"use client";
import { motion } from "motion/react";
import { useAuthStore } from "@/store/useAuthStore";
import { GAME_TYPES }   from "@/lib/statsService";

export function OverallStats() {
  const profile = useAuthStore((s) => s.profile);

  // aggregate across all game types
  const totals = GAME_TYPES.reduce(
    (acc, gt) => {
      const s = profile?.stats?.[gt] ?? {};
      acc.wins   += s.wins   ?? 0;
      acc.losses += s.losses ?? 0;
      acc.draws  += s.draws  ?? 0;
      return acc;
    },
    { wins: 0, losses: 0, draws: 0 }
  );

  const total   = totals.wins + totals.losses + totals.draws;
  const rate    = total ? Math.round((totals.wins / total) * 100) : 0;

  const items = [
    { label: "Total Games", value: total,         color: "text-foreground"      },
    { label: "Wins",        value: totals.wins,   color: "text-primary"         },
    { label: "Losses",      value: totals.losses, color: "text-destructive"     },
    { label: "Draws",       value: totals.draws,  color: "text-muted-foreground"},
    { label: "Win Rate",    value: `${rate}%`,    color: "text-accent-game"     },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-heading text-xs font-black tracking-widest text-foreground">
        OVERALL
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {items.map(({ label, value, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
            className="bg-background border border-border rounded-sm p-4 flex flex-col gap-1"
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
          <span className="font-mono text-[10px] text-primary">{rate}%</span>
        </div>
        <div className="h-1.5 bg-background border border-border rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${rate}%` }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.3 }}
          />
        </div>
        {/* wins vs losses breakdown */}
        <div className="flex h-2 rounded-full overflow-hidden gap-px mt-1">
          <motion.div
            className="bg-primary h-full"
            initial={{ width: 0 }}
            animate={{ width: total ? `${(totals.wins / total) * 100}%` : "0%" }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.4 }}
          />
          <motion.div
            className="bg-muted-foreground/30 h-full"
            initial={{ width: 0 }}
            animate={{ width: total ? `${(totals.draws / total) * 100}%` : "0%" }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.5 }}
          />
          <motion.div
            className="bg-destructive/60 h-full flex-1"
          />
        </div>
        <div className="flex gap-4 mt-0.5">
          {[
            { label: "Win",  color: "bg-primary"           },
            { label: "Draw", color: "bg-muted-foreground/30"},
            { label: "Loss", color: "bg-destructive/60"    },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${color}`} />
              <span className="font-mono text-[9px] text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}