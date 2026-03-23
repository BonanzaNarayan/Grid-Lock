"use client";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const styles = {
  waiting:  "text-accent-game  border-accent-game/30  bg-accent-game/10",
  active:   "text-primary      border-primary/30      bg-primary/10",
  finished: "text-muted-foreground border-border-game bg-card",
};

export function StatusBadge({ status }) {
  const isLive = status === "active";
  const label = { waiting: "Waiting", active: "Live", finished: "Finished" }[status] ?? "Waiting";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-sm border",
        styles[status] ?? styles.waiting
      )}
    >
      {isLive && (
        <motion.span
          className="w-1.5 h-1.5 rounded-full bg-primary"
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
      )}
      {label}
    </span>
  );
}