"use client";
import { motion }              from "motion/react";
import { useEffect, useState } from "react";
import { getUserAchievements, ACHIEVEMENTS, RARITY_STYLES } from "@/lib/achievementService";
import { AchievementBadge }    from "@/components/achievements/AchievementBadge";

const CATEGORIES = ["All", "Milestones", "Streaks", "Special", "Social", "Variety", "Chat", "Level"];

const RARITY_ORDER = { legendary: 0, epic: 1, rare: 2, common: 3 };

export function AchievementGrid({ uid }) {
  const [unlocked,  setUnlocked]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [category,  setCategory]  = useState("All");

  useEffect(() => {
    if (!uid) return;
    getUserAchievements(uid).then((data) => {
      setUnlocked(data);
      setLoading(false);
    });
  }, [uid]);

  const unlockedMap = Object.fromEntries(
    unlocked.map((u) => [u.id, u])
  );

  const unlockedCount = unlocked.length;
  const totalCount    = ACHIEVEMENTS.length;

  const filtered = ACHIEVEMENTS
    .filter((a) => category === "All" || a.category === category)
    .sort((a, b) => {
      const aUnlocked = !!unlockedMap[a.id];
      const bUnlocked = !!unlockedMap[b.id];
      if (aUnlocked !== bUnlocked) return bUnlocked ? 1 : -1;
      return (RARITY_ORDER[a.rarity] ?? 3) - (RARITY_ORDER[b.rarity] ?? 3);
    });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ duration: 0.4 }}
      className="relative bg-card border border-border rounded-sm overflow-hidden"
    >
      <span className="absolute top-0 left-6 right-6 h-px bg-primary opacity-20" />

      {/* header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h3 className="font-heading text-xs font-black tracking-widest text-foreground">
            ACHIEVEMENTS
          </h3>
          <span className="font-mono text-[10px] text-muted-foreground">
            {unlockedCount} / {totalCount}
          </span>
        </div>

        {/* progress bar */}
        <div className="flex items-center gap-2 flex-1 max-w-xs">
          <div className="flex-1 h-1.5 bg-background border border-border rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(unlockedCount / totalCount) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <span className="font-mono text-[10px] text-primary shrink-0">
            {Math.round((unlockedCount / totalCount) * 100)}%
          </span>
        </div>
      </div>

      {/* category filter */}
      <div className="flex overflow-x-auto border-b border-border px-4 py-2 gap-1 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`font-mono text-[10px] tracking-widest uppercase px-3 py-1.5 rounded-sm whitespace-nowrap transition-colors duration-150 shrink-0
              ${category === cat
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-background"}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* rarity legend */}
      <div className="flex items-center gap-4 px-6 py-3 border-b border-border flex-wrap">
        {Object.entries(RARITY_STYLES).map(([rarity, style]) => (
          <div key={rarity} className="flex items-center gap-1.5">
            <div className={cn(
              "w-3 h-3 rounded-sm border",
              style.border, style.bg
            )} />
            <span className={`font-mono text-[9px] uppercase tracking-widest ${style.label}`}>
              {rarity}
            </span>
          </div>
        ))}
      </div>

      {/* grid */}
      {loading ? (
        <div className="px-6 py-12 flex items-center justify-center">
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-primary"
          />
        </div>
      ) : (
        <div className="p-6 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {filtered.map((ach, i) => {
            const unlockedData = unlockedMap[ach.id];
            return (
              <motion.div
                key={ach.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1   }}
                transition={{ duration: 0.2, delay: Math.min(i * 0.03, 0.3) }}
              >
                <AchievementBadge
                  achievement={ach}
                  unlocked={!!unlockedData}
                  unlockedAt={unlockedData?.unlockedAt}
                  size="md"
                />
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

// need cn import
import { cn } from "@/lib/utils";