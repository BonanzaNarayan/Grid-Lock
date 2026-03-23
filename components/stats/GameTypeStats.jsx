"use client";
import { motion } from "motion/react";
import { useAuthStore } from "@/store/useAuthStore";
import { GAME_TYPES }   from "@/lib/statsService";

const GAME_LABELS = {
  "tic-tac-toe": { label: "Tic-Tac-Toe", icon: "✕ ○" },
  "connect-four": { label: "Connect Four", icon: "◉ ◉" },
};

export function GameTypeStats() {
  const profile = useAuthStore((s) => s.profile);

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-heading text-xs font-black tracking-widest text-foreground">
        PER GAME
      </h3>
      <div className="flex flex-col gap-3">
        {GAME_TYPES.map((gt, gi) => {
          const s      = profile?.stats?.[gt] ?? { wins: 0, losses: 0, draws: 0 };
          const total  = (s.wins ?? 0) + (s.losses ?? 0) + (s.draws ?? 0);
          const rate   = total ? Math.round(((s.wins ?? 0) / total) * 100) : 0;
          const meta   = GAME_LABELS[gt] ?? { label: gt, icon: "?" };

          return (
            <motion.div
              key={gt}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0   }}
              transition={{ duration: 0.35, delay: gi * 0.08 }}
              className="relative bg-background border border-border rounded-sm p-5 flex flex-col gap-4"
            >
              <span className="absolute top-0 left-4 right-4 h-px bg-primary opacity-10" />

              {/* game header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-lg text-primary">{meta.icon}</span>
                  <span className="font-heading text-sm font-black text-foreground tracking-wide">
                    {meta.label}
                  </span>
                </div>
                <span className={`font-heading text-lg font-black ${
                  rate >= 60 ? "text-primary"
                  : rate >= 40 ? "text-accent-game"
                  : "text-destructive"
                }`}>
                  {rate}%
                </span>
              </div>

              {/* stat row */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Played", value: total,      color: "text-foreground"       },
                  { label: "Wins",   value: s.wins ?? 0,   color: "text-primary"       },
                  { label: "Losses", value: s.losses ?? 0, color: "text-destructive"   },
                  { label: "Draws",  value: s.draws ?? 0,  color: "text-muted-foreground" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex flex-col gap-0.5">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                      {label}
                    </span>
                    <span className={`font-heading text-xl font-black ${color}`}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {/* win rate bar */}
              <div className="h-1 bg-border rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${rate}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 + gi * 0.1 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}