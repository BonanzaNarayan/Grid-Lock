"use client";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "stats",       label: "My Stats"    },
  { id: "leaderboard", label: "Leaderboard" },
];

export function StatsTabs({ active, onChange }) {
  return (
    <div className="flex border-b border-border">
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative font-mono text-xs tracking-widest uppercase px-6 py-3 transition-colors duration-150",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            {isActive && (
              <motion.span
                layoutId="stats-tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-px bg-primary"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}