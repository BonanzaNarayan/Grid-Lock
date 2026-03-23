"use client";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot, limit } from "firebase/firestore";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { GlowButton }  from "@/components/ui/GlowButton";
import { Copy, Check, Lock } from "lucide-react";

function RoomRow({ room, i }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(room.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleOpen() {
    window.open(`/room/${room.id}`, "_blank");
  }

  const opponent =
    room.players?.O?.displayName ?? null;

  const modeLabel =
    room.mode === "bo1" ? "1 Round"
    : room.mode === "bo3" ? "Best of 3"
    : "Best of 5";

  const scoreLabel =
    room.status === "active" || room.status === "finished"
      ? `${room.scores?.X ?? 0} — ${room.scores?.O ?? 0}`
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1,  x: 0   }}
      transition={{ duration: 0.3, delay: i * 0.06 }}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-border last:border-0 hover:bg-background transition-colors duration-150"
    >
      {/* left — room info */}
      <div className="flex flex-col gap-1 min-w-0">

        {/* top row — code + badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs text-foreground">
            #{room.id.slice(0, 8).toUpperCase()}
          </span>
          <StatusBadge status={room.status} />
          {room.isPrivate && (
            <span className="inline-flex items-center gap-1 font-mono text-[9px] tracking-widest text-muted-foreground border border-border-game px-1.5 py-0.5 rounded-sm">
              <Lock size={9} />
              PRIVATE
            </span>
          )}
        </div>

        {/* bottom row — meta */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[10px] text-muted-foreground tracking-widest">
            {room.gameType}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">·</span>
          <span className="font-mono text-[10px] text-muted-foreground">
            {modeLabel}
          </span>
          {opponent ? (
            <>
              <span className="font-mono text-[10px] text-muted-foreground">·</span>
              <span className="font-mono text-[10px] text-muted-foreground">
                vs{" "}
                <span className="text-foreground">{opponent}</span>
              </span>
            </>
          ) : (
            <>
              <span className="font-mono text-[10px] text-muted-foreground">·</span>
              <span className="font-mono text-[10px] text-muted-foreground">
                Waiting for opponent
              </span>
            </>
          )}
          {scoreLabel && (
            <>
              <span className="font-mono text-[10px] text-muted-foreground">·</span>
              <span className="font-mono text-[10px] text-primary font-black">
                {scoreLabel}
              </span>
            </>
          )}
        </div>
      </div>

      {/* right — actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* copy code — only useful while waiting */}
        {room.status === "waiting" && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground border border-border-game px-3 py-1.5 rounded-sm hover:border-primary hover:text-primary transition-colors duration-150"
          >
            {copied
              ? <><Check size={11} className="text-primary" /> Copied</>
              : <><Copy size={11} /> Copy Code</>
            }
          </button>
        )}

        {/* open room */}
        {room.status !== "finished" && (
          <GlowButton
            variant={room.status === "active" ? "primary" : "ghost"}
            className="text-[10px] py-1.5 px-3"
            onClick={handleOpen}
          >
            {room.status === "waiting" ? "Open Room" : "Rejoin"}
          </GlowButton>
        )}

        {/* finished — just a label */}
        {room.status === "finished" && (
          <span className="font-mono text-[10px] text-muted-foreground">
            {room.winner === "draw"
              ? "Draw"
              : room.winner === "X"
              ? room.players?.X?.uid ? "You won" : "X won"
              : "You lost"}
          </span>
        )}
      </div>
    </motion.div>
  );
}

export function MyRooms() {
  const user              = useAuthStore((s) => s.user);
  const [rooms,   setRooms]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "rooms"),
      where("createdBy", "==", user.uid),
      limit(10)
    );

    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          // active first, then waiting, then finished
          const order = { active: 0, waiting: 1, finished: 2 };
          const statusDiff = (order[a.status] ?? 3) - (order[b.status] ?? 3);
          if (statusDiff !== 0) return statusDiff;
          // within same status, most recent first
          return (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0);
        });
      setRooms(docs);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  const activeCount  = rooms.filter((r) => r.status === "active").length;
  const waitingCount = rooms.filter((r) => r.status === "waiting").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="relative bg-card border border-border rounded-sm overflow-hidden"
    >
      <span className="absolute top-0 left-6 right-6 h-px bg-primary opacity-20" />

      {/* header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h3 className="font-heading text-sm font-black tracking-widest text-foreground">
          MY ROOMS
        </h3>
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-primary border border-primary/30 bg-primary/10 px-2 py-0.5 rounded-sm">
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-primary"
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              {activeCount} ACTIVE
            </span>
          )}
          {waitingCount > 0 && (
            <span className="font-mono text-[10px] text-muted-foreground border border-border-game px-2 py-0.5 rounded-sm">
              {waitingCount} WAITING
            </span>
          )}
        </div>
      </div>

      {/* body */}
      {loading ? (
        <div className="px-6 py-8 flex items-center justify-center">
          <p className="font-mono text-xs text-muted-foreground tracking-widest animate-pulse">
            LOADING...
          </p>
        </div>
      ) : rooms.length === 0 ? (
        <div className="px-6 py-8 text-center">
          <p className="font-mono text-xs text-muted-foreground tracking-widest">
            No rooms yet. Create one above!
          </p>
        </div>
      ) : (
        <div>
          {rooms.map((room, i) => (
            <RoomRow key={room.id} room={room} i={i} />
          ))}
        </div>
      )}
    </motion.div>
  );
}