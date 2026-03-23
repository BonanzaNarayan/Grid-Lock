"use client";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, where, limit, onSnapshot } from "firebase/firestore";
import { StatusBadge }  from "@/components/ui/StatusBadge";
import { GlowButton }   from "@/components/ui/GlowButton";
import { useAuthStore } from "@/store/useAuthStore";
import { joinRoom }     from "@/lib/roomService";

export function ActiveRooms() {
  const [rooms,   setRooms]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(null); // roomId currently being joined
  const [error,   setError]   = useState(null);
  const router = useRouter();
  const { user, profile } = useAuthStore();

  useEffect(() => {
    const q = query(
      collection(db, "rooms"),
      where("status", "==", "waiting"),
      where("isPrivate", "==", false),
      limit(8)
    );
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => b.createdAt?.toMillis?.() - a.createdAt?.toMillis?.());
      setRooms(docs);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function handleJoin(room) {
    if (joining) return;
    setError(null);
    setJoining(room.id);
    try {
      await joinRoom({ roomId: room.id, user, profile });
      router.push(`/room/${room.id}`);
    } catch (err) {
      setError({ id: room.id, message: err.message ?? "Failed to join room." });
    } finally {
      setJoining(null);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="relative bg-card border border-border rounded-sm overflow-hidden"
    >
      <span className="absolute top-0 left-6 right-6 h-px bg-primary opacity-20" />

      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h3 className="font-heading text-sm font-black tracking-widest text-foreground">
          OPEN ROOMS
        </h3>
        <StatusBadge status="waiting" />
      </div>

      {loading ? (
        <div className="px-6 py-8 flex items-center justify-center">
          <p className="font-mono text-xs text-muted-foreground tracking-widest animate-pulse">
            SCANNING...
          </p>
        </div>
      ) : rooms.length === 0 ? (
        <div className="px-6 py-8 text-center">
          <p className="font-mono text-xs text-muted-foreground tracking-widest">
            No open rooms. Create one!
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {rooms.map((room, i) => {
            const isOwner      = room.players?.X?.uid === user?.uid;
            const isJoining    = joining === room.id;
            const roomError    = error?.id === room.id ? error.message : null;

            return (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="flex flex-col px-6 py-3 hover:bg-background transition-colors duration-150"
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="font-mono text-xs text-foreground truncate">
                      {room.players?.X?.displayName ?? "Unknown"}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-muted-foreground tracking-widest">
                        {room.gameType}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        · {room.mode === "bo1" ? "1 Round" : room.mode === "bo3" ? "Best of 3" : "Best of 5"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] text-muted-foreground hidden sm:block">
                      #{room.id.slice(0, 6).toUpperCase()}
                    </span>
                    {isOwner ? (
                      <span className="font-mono text-[10px] text-muted-foreground border border-border-game px-2 py-1 rounded-sm">
                        YOUR ROOM
                      </span>
                    ) : (
                      <GlowButton
                        variant="ghost"
                        className="text-[10px] py-1 px-3"
                        disabled={!!joining}
                        onClick={() => handleJoin(room)}
                      >
                        {isJoining ? "Joining..." : "Join"}
                      </GlowButton>
                    )}
                  </div>
                </div>

                {/* per-room error */}
                {roomError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1,  y: 0  }}
                    className="font-mono text-[10px] text-destructive mt-1.5"
                  >
                    {roomError}
                  </motion.p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}