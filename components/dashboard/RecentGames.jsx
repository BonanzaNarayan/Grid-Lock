"use client";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { db } from "@/lib/firebase";
import { collection, query, where, limit, onSnapshot } from "firebase/firestore";

function ResultBadge({ result }) {
  const styles = {
    win:  "text-primary     border-primary/30     bg-primary/10",
    loss: "text-destructive border-destructive/30 bg-destructive/10",
    draw: "text-muted-foreground border-border    bg-background",
  };
  return (
    <span className={`font-mono text-[10px] px-2 py-0.5 rounded-sm border ${styles[result]}`}>
      {result.toUpperCase()}
    </span>
  );
}

export function RecentGames() {
  const user              = useAuthStore((s) => s.user);
  const [games,   setGames]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // two single-field filters — no composite index needed
    const q = query(
      collection(db, "rooms"),
      where("status",     "==",             "finished"),
      where("playerUids", "array-contains", user.uid),
      limit(10)
    );

    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs
        .map((d) => {
          const data    = d.data();
          const isX     = data.players?.X?.uid === user.uid;
          const myMark  = isX ? "X" : "O";
          const maxWins =
            data.mode === "bo1" ? 1 : data.mode === "bo3" ? 2 : 3;
          const matchWinner =
            data.scores?.X >= maxWins ? "X"
            : data.scores?.O >= maxWins ? "O"
            : "draw";
          const result  =
            matchWinner === "draw"   ? "draw"
            : matchWinner === myMark ? "win"
            : "loss";
          const opponent = isX
            ? data.players?.O?.displayName
            : data.players?.X?.displayName;
          return {
            id:         d.id,
            result,
            opponent,
            gameType:   data.gameType,
            finishedAt: data.finishedAt,
          };
        })
        // sort client-side by finishedAt descending
        .sort((a, b) => b.finishedAt?.toMillis?.() - a.finishedAt?.toMillis?.())
        .slice(0, 6); // keep only the 6 most recent after sort

      setGames(docs);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="relative bg-card border border-border rounded-sm overflow-hidden"
    >
      <span className="absolute top-0 left-6 right-6 h-px bg-primary opacity-20" />

      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h3 className="font-heading text-sm font-black tracking-widest text-foreground">
          RECENT GAMES
        </h3>
      </div>

      {loading ? (
        <div className="px-6 py-8 flex items-center justify-center">
          <p className="font-mono text-xs text-muted-foreground tracking-widest animate-pulse">
            LOADING...
          </p>
        </div>
      ) : games.length === 0 ? (
        <div className="px-6 py-8 text-center">
          <p className="font-mono text-xs text-muted-foreground tracking-widest">
            No games yet. Play your first match!
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {games.map((game, i) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
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
              <ResultBadge result={game.result} />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}