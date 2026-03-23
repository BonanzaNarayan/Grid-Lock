"use client";
import { motion }         from "motion/react";
import { RARITY_STYLES }  from "@/lib/achievementService";
import { cn }             from "@/lib/utils";
import { Lock }           from "lucide-react";

export function AchievementBadge({ achievement, unlocked = false, unlockedAt = null, size = "md" }) {
  const rarity = unlocked ? (achievement.rarity ?? "common") : "common";
  const style  = RARITY_STYLES[rarity];

  const sizes = {
    sm: { outer: "w-14 h-14", icon: "text-2xl",  title: "text-[9px]"  },
    md: { outer: "w-20 h-20", icon: "text-3xl",  title: "text-[10px]" },
    lg: { outer: "w-24 h-24", icon: "text-4xl",  title: "text-xs"     },
  };
  const sz = sizes[size] ?? sizes.md;

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className="flex flex-col items-center gap-1.5 group cursor-default"
      title={`${achievement.title} — ${achievement.description}`}
    >
      {/* badge */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-sm border transition-all duration-200",
          sz.outer,
          style.border,
          style.bg,
          unlocked && rarity !== "common" ? `shadow-lg ${style.glow}` : "",
          !unlocked && "opacity-40 grayscale"
        )}
      >
        {/* rarity corner accent */}
        {unlocked && rarity !== "common" && (
          <span className={cn(
            "absolute top-0 right-0 w-0 h-0",
            "border-t-[12px] border-r-[12px] border-b-transparent border-l-transparent",
            rarity === "rare"      && "border-t-blue-500/60   border-r-blue-500/60",
            rarity === "epic"      && "border-t-purple-500/60 border-r-purple-500/60",
            rarity === "legendary" && "border-t-yellow-400/80 border-r-yellow-400/80",
          )} />
        )}

        {unlocked ? (
          <span className={sz.icon}>{achievement.icon}</span>
        ) : (
          <Lock size={size === "lg" ? 20 : 14} className="text-muted-foreground" />
        )}
      </div>

      {/* title */}
      <span className={cn(
        "font-mono font-black tracking-widest text-center leading-tight max-w-[80px]",
        sz.title,
        unlocked ? style.label : "text-muted-foreground"
      )}>
        {achievement.title}
      </span>

      {/* unlock date */}
      {unlocked && unlockedAt && (
        <span className="font-mono text-[8px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          {new Date(unlockedAt?.toMillis?.() ?? unlockedAt).toLocaleDateString()}
        </span>
      )}
    </motion.div>
  );
}