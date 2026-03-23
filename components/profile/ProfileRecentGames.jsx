"use client";
import { motion }            from "motion/react";
import { useEffect, useState } from "react";
import { db }                from "@/lib/firebase";
import {
  collection, query, where, onSnapshot,
} from "firebase/firestore";

export function ProfileRecentGames({ uid }) {
  const [games,   setGames]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    const q = query(
      collection(db, "rooms"),
      where("status",     "==",             "finished"),
      where("playerUids", "array-contains", uid)
    );
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs
        .map((d) => {
          const data  = d.data();
          const isX   = data.players?.X?.uid === uid;
          const mark  = isX ? "X" : "O";
          const mode  = data.mode ?? "bo1";
          const max   = mode === "bo1" ? 1 : mode === "bo3" ? 2 : 3;
          const mw    =
            data.scores?.X >= max ? "X"
            : data.scores?.O >= max ? "O"
            : "draw";
          return {
            id:         d.id,
            result:     mw === "draw" ? "draw" : mw === mark ? "win" : "loss",
            opponent:   isX ? data.players?.O?.displayName : data.players?.X?.displayName,
            gameType:   data.gameType,
            finishedAt: data.finishedAt,
          };
        })
        .sort((a, b) => (b.finishedAt?.toMillis?.() ?? 0) - (a.finishedAt?.toMillis?.() ?? 0))
        .slice(0, 6);
      setGames(docs);
      setLoading(false);
    });
    return () => unsub();
  }, [uid]);

  const resultStyles = {
    win:  "text-primary     border-primary/30     bg-primary/10",
    loss: "text-destructive border-destructive/30 bg-destructive/10",
    draw: "text-muted-foreground border-border    bg-background",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="relative bg-card border border-border rounded-sm overflow-hidden"
    >
      <span className="absolute top-0 left-6 right-6 h-px bg-primary opacity-20" />
      <div className="px-6 py-4 border-b border-border">
        <h3 className="font-heading text-xs font-black tracking-widest text-foreground">
          RECENT GAMES
        </h3>
      </div>

      {loading ? (
        <div className="px-6 py-8 flex items-center justify-center">
          <p className="font-mono text-xs text-muted-foreground animate-pulse tracking-widest">
            LOADING...
          </p>
        </div>
      ) : games.length === 0 ? (
        <div className="px-6 py-8 text-center">
          <p className="font-mono text-xs text-muted-foreground tracking-widest">
            No games played yet.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {games.map((game, i) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1,  x: 0  }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between px-6 py-3"
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-xs text-foreground">
                  vs {game.opponent ?? "Unknown"}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground tracking-widest">
                  {game.gameType}
                </span>
              </div>
              <span className={`font-mono text-[10px] px-2 py-0.5 rounded-sm border ${resultStyles[game.result]}`}>
                {game.result.toUpperCase()}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}