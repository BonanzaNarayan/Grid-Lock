"use client";
import { motion } from "motion/react";
import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";

const GAMES = [
  { id: "tic-tac-toe",  label: "Tic-Tac-Toe", icon: "✕ ○" },
  { id: "connect-four", label: "Connect Four", icon: "◉ ◉" },
];

export function PlayerStatsCard() {
  const profile        = useAuthStore((s) => s.profile);
  const [active, setActive] = useState("tic-tac-toe");

  // aggregate all games for the "overall" totals
  const overall = GAMES.reduce(
    (acc, g) => {
      const s = profile?.stats?.[g.id] ?? {};
      acc.wins   += s.wins   ?? 0;
      acc.losses += s.losses ?? 0;
      acc.draws  += s.draws  ?? 0;
      return acc;
    },
    { wins: 0, losses: 0, draws: 0 }
  );
  const overallTotal   = overall.wins + overall.losses + overall.draws;
  const overallRate    = overallTotal
    ? Math.round((overall.wins / overallTotal) * 100)
    : 0;

  // per-game stats
  const gameStats      = profile?.stats?.[active] ?? { wins: 0, losses: 0, draws: 0 };
  const total          = (gameStats.wins ?? 0) + (gameStats.losses ?? 0) + (gameStats.draws ?? 0);
  const winRate        = total ? Math.round(((gameStats.wins ?? 0) / total) * 100) : 0;

  const items = [
    { label: "Wins",     value: gameStats.wins   ?? 0, color: "text-primary"          },
    { label: "Losses",   value: gameStats.losses ?? 0, color: "text-destructive"       },
    { label: "Draws",    value: gameStats.draws  ?? 0, color: "text-muted-foreground"  },
    { label: "Win Rate", value: `${winRate}%`,          color: "text-accent-game"      },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ duration: 0.4 }}
      className="relative bg-card border border-border rounded-sm p-6 flex flex-col gap-5"
    >
      <span className="absolute top-0 left-6 right-6 h-px bg-primary opacity-20" />

      {/* header row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="font-heading text-sm font-black tracking-widest text-foreground">
          YOUR STATS
        </h3>

        {/* overall totals */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-muted-foreground">
            Overall:
          </span>
          <span className="font-mono text-[10px] text-primary font-black">
            {overall.wins}W
          </span>
          <span className="font-mono text-[10px] text-destructive">
            {overall.losses}L
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">
            {overall.draws}D
          </span>
          <span className="font-mono text-[10px] text-accent-game">
            {overallRate}%
          </span>
        </div>
      </div>

      {/* game type tabs */}
      <div className="flex bg-background border border-border rounded-sm overflow-hidden w-fit">
        {GAMES.map((g) => (
          <button
            key={g.id}
            onClick={() => setActive(g.id)}
            className={`flex items-center gap-2 font-mono text-xs tracking-widest px-4 py-2 transition-colors duration-150
              ${active === g.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"}`}
          >
            <span className="text-sm">{g.icon}</span>
            {g.label}
          </button>
        ))}
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map(({ label, value, color }, i) => (
          <motion.div
            key={`${active}-${label}`}
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
            WIN RATE — {GAMES.find((g) => g.id === active)?.label}
          </span>
          <span className="font-mono text-[10px] text-primary">{winRate}%</span>
        </div>
        <div className="h-1.5 bg-background border border-border rounded-full overflow-hidden">
          <motion.div
            key={`${active}-bar`}
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${winRate}%` }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          />
        </div>
      </div>
    </motion.div>
  );
}