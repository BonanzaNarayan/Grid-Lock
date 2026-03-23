"use client";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useAuthStore }   from "@/store/useAuthStore";
import { getStreakData }   from "@/lib/statsService";
import { Zap, Trophy }    from "lucide-react";

export function StreakCard() {
  const { user }  = useAuthStore();
  const [data,    setData]    = useState({ current: 0, best: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getStreakData(user.uid).then((d) => { setData(d); setLoading(false); });
  }, [user]);

  const items = [
    {
      label: "Current Streak",
      value: data.current,
      icon:  Zap,
      color: data.current > 0 ? "text-accent-game" : "text-muted-foreground",
      border: data.current > 0 ? "border-accent-game/30 bg-accent-game/5" : "border-border bg-background",
    },
    {
      label: "Best Streak",
      value: data.best,
      icon:  Trophy,
      color: "text-primary",
      border: "border-primary/30 bg-primary/5",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {items.map(({ label, value, icon: Icon, color, border }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.35, delay: i * 0.08 }}
          className={`relative border rounded-sm p-5 flex flex-col gap-2 ${border}`}
        >
          <div className="flex items-center gap-2">
            <Icon size={14} className={color} />
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {label}
            </span>
          </div>
          {loading ? (
            <div className="h-8 w-12 bg-border rounded-sm animate-pulse" />
          ) : (
            <motion.span
              initial={{ scale: 0.8 }}
              animate={{ scale: 1    }}
              className={`font-heading text-3xl font-black ${color}`}
            >
              {value}
              <span className="font-mono text-xs text-muted-foreground ml-1">
                {value === 1 ? "win" : "wins"}
              </span>
            </motion.span>
          )}
        </motion.div>
      ))}
    </div>
  );
}