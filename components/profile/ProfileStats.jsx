"use client";
import { motion }    from "motion/react";
import { useState }  from "react";

const GAMES = [
  { id: "tic-tac-toe",  label: "Tic-Tac-Toe", icon: "✕ ○" },
  { id: "connect-four", label: "Connect Four", icon: "◉ ◉" },
];

export function ProfileStats({ stats = {} }) {
  const [active, setActive] = useState("tic-tac-toe");
  const s     = stats[active] ?? { wins: 0, losses: 0, draws: 0 };
  const total = (s.wins ?? 0) + (s.losses ?? 0) + (s.draws ?? 0);
  const rate  = total ? Math.round(((s.wins ?? 0) / total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="relative bg-card border border-border rounded-sm p-6 flex flex-col gap-4"
    >
      <span className="absolute top-0 left-6 right-6 h-px bg-primary opacity-20" />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="font-heading text-xs font-black tracking-widest text-foreground">
          STATS
        </h3>
        <div className="flex bg-background border border-border rounded-sm overflow-hidden">
          {GAMES.map((g) => (
            <button
              key={g.id}
              onClick={() => setActive(g.id)}
              className={`flex items-center gap-1.5 font-mono text-[10px] tracking-widest px-3 py-1.5 transition-colors duration-150
                ${active === g.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"}`}
            >
              <span>{g.icon}</span>
              <span className="hidden sm:inline">{g.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Games",  value: total,     color: "text-foreground"      },
          { label: "Wins",   value: s.wins ?? 0,   color: "text-primary"     },
          { label: "Losses", value: s.losses ?? 0, color: "text-destructive" },
          { label: "Draws",  value: s.draws ?? 0,  color: "text-muted-foreground" },
        ].map(({ label, value, color }, i) => (
          <motion.div
            key={`${active}-${label}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.07 }}
            className="bg-background border border-border rounded-sm p-3 flex flex-col gap-1"
          >
            <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              {label}
            </span>
            <span className={`font-heading text-2xl font-black ${color}`}>
              {value}
            </span>
          </motion.div>
        ))}
      </div>

      {/* rate bar */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between">
          <span className="font-mono text-[10px] text-muted-foreground tracking-widest">
            WIN RATE
          </span>
          <span className="font-mono text-[10px] text-primary">{rate}%</span>
        </div>
        <div className="h-1.5 bg-background border border-border rounded-full overflow-hidden">
          <motion.div
            key={`${active}-bar`}
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${rate}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
}