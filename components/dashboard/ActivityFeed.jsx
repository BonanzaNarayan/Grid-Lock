"use client";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState }     from "react";
import { useAuthStore }            from "@/store/useAuthStore";
import { watchActivity }           from "@/lib/activityService";

const TYPE_STYLES = {
  win:          { color: "text-primary",          icon: "🏆" },
  loss:         { color: "text-destructive",       icon: "💀" },
  draw:         { color: "text-muted-foreground",  icon: "🤝" },
  friend_added: { color: "text-accent-game",       icon: "👥" },
  level_up:     { color: "text-yellow-400",        icon: "⚡" },
};

function timeAgo(ts) {
  if (!ts?.toMillis) return "";
  const diff = Date.now() - ts.toMillis();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return "just now";
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function ActivityFeed() {
  const { user }           = useAuthStore();
  const [items, setItems]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsub = watchActivity(user.uid, (data) => {
      setItems(data);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="relative bg-card border border-border rounded-sm overflow-hidden"
    >
      <span className="absolute top-0 left-6 right-6 h-px bg-primary opacity-20" />

      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h3 className="font-heading text-sm font-black tracking-widest text-foreground">
          ACTIVITY
        </h3>
        {items.length > 0 && (
          <motion.span
            className="w-1.5 h-1.5 rounded-full bg-primary"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          />
        )}
      </div>

      {loading ? (
        <div className="px-6 py-8 flex items-center justify-center">
          <p className="font-mono text-xs text-muted-foreground animate-pulse tracking-widest">
            LOADING...
          </p>
        </div>
      ) : items.length === 0 ? (
        <div className="px-6 py-8 text-center">
          <p className="font-mono text-xs text-muted-foreground tracking-widest">
            No activity yet. Play a game!
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border max-h-72 overflow-y-auto">
          <AnimatePresence>
            {items.map((item, i) => {
              const style = TYPE_STYLES[item.type] ?? TYPE_STYLES.draw;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1,  x: 0  }}
                  exit={{   opacity: 0,   x: 8  }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center justify-between px-6 py-3 hover:bg-background transition-colors duration-150"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-base shrink-0">{style.icon}</span>
                    <span className={`font-mono text-xs truncate ${style.color}`}>
                      {item.message}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground shrink-0 ml-3">
                    {timeAgo(item.createdAt)}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}