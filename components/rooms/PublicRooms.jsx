"use client";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState }     from "react";
import { useAuthModal }            from "@/store/useAuthModal";
import { db }                      from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { getAvatar }      from "@/lib/avatars";
import { StatusBadge }    from "@/components/ui/StatusBadge";
import { GlowButton }     from "@/components/ui/GlowButton";
import { Clock }          from "lucide-react";

const MODE_LABELS = { bo1: "1 Round", bo3: "Best of 3", bo5: "Best of 5" };

export function PublicRooms() {
  const { open }           = useAuthModal();
  const [rooms,   setRooms]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "rooms"),
      where("status",    "==", "waiting"),
      where("isPrivate", "==", false)
    );
    const unsub = onSnapshot(q, (snap) => {
      setRooms(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) =>
            (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)
          )
      );
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <div className="flex flex-col gap-6">

      {/* live counter */}
      <div className="flex items-center gap-3">
        <motion.span
          className="w-1.5 h-1.5 rounded-full bg-primary"
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        />
        <span className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase">
          {loading ? "Loading..." : `${rooms.length} open room${rooms.length !== 1 ? "s" : ""} live`}
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* table header */}
      <div className="hidden sm:grid grid-cols-12 gap-2 px-4 py-2 border-b border-border">
        {["Room", "Creator", "Game", "Mode", "Timer", ""].map((h, i) => (
          <span
            key={i}
            className={`font-mono text-[9px] uppercase tracking-widest text-muted-foreground
              ${i === 0 ? "col-span-2" : i === 1 ? "col-span-3" : i === 2 ? "col-span-2"
              : i === 3 ? "col-span-2" : i === 4 ? "col-span-1" : "col-span-2 text-right"}`}
          >
            {h}
          </span>
        ))}
      </div>

      {/* rows */}
      {loading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-card border border-border rounded-sm animate-pulse" />
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <div className="py-16 text-center flex flex-col items-center gap-3">
          <p className="font-mono text-xs text-muted-foreground tracking-widest">
            No open rooms right now. Check back soon!
          </p>
          <GlowButton onClick={() => open("signup")} className="mt-2">
            Create a Room
          </GlowButton>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <AnimatePresence>
            {rooms.map((room, i) => {
              const avatar = getAvatar(room.players?.X?.avatarId);
              return (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1,  x: 0  }}
                  exit={{   opacity: 0,   x: 8  }}
                  transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.2) }}
                  className="bg-card border border-border rounded-sm px-4 py-3 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center hover:border-border-game transition-colors duration-150"
                >
                  {/* room id */}
                  <div className="sm:col-span-2 flex items-center gap-2">
                    <span className="font-mono text-xs text-primary font-black">
                      #{room.id.slice(0, 6).toUpperCase()}
                    </span>
                    <StatusBadge status="waiting" />
                  </div>

                  {/* creator */}
                  <div className="sm:col-span-3 flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-sm bg-background border border-border flex items-center justify-center text-sm shrink-0">
                      {avatar.icon}
                    </div>
                    <span className="font-mono text-xs text-foreground truncate">
                      {room.players?.X?.displayName ?? "Unknown"}
                    </span>
                  </div>

                  {/* game */}
                  <span className="sm:col-span-2 font-mono text-[10px] text-muted-foreground">
                    {room.gameType}
                  </span>

                  {/* mode */}
                  <span className="sm:col-span-2 font-mono text-[10px] text-muted-foreground">
                    {MODE_LABELS[room.mode] ?? room.mode}
                  </span>

                  {/* timer */}
                  <span className="sm:col-span-1 flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                    <Clock size={10} />
                    {room.timerSecs}s
                  </span>

                  {/* CTA */}
                  <div className="sm:col-span-2 flex justify-end">
                    <button
                      onClick={() => open("signup")}
                      className="font-mono text-[10px] text-primary border border-primary/30 hover:bg-primary/10 px-3 py-1.5 rounded-sm transition-colors duration-150 tracking-widest"
                    >
                      Sign up to Join →
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* bottom CTA */}
      {rooms.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1,  y: 0  }}
          transition={{ delay: 0.4 }}
          className="relative bg-card border border-border rounded-sm px-6 py-8 flex flex-col items-center gap-4 overflow-hidden"
        >
          <span className="absolute top-0 left-6 right-6 h-px bg-primary opacity-30" />
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <p className="font-heading text-lg font-black text-foreground text-center relative z-10">
            READY TO <span className="text-primary">PLAY?</span>
          </p>
          <p className="font-sans text-sm text-muted-foreground text-center relative z-10">
            Create a free account and jump into any open room instantly.
          </p>
          <div className="flex gap-3 relative z-10">
            <GlowButton onClick={() => open("signup")}>
              Sign Up Free
            </GlowButton>
            <GlowButton variant="ghost" onClick={() => open("login")}>
              Login
            </GlowButton>
          </div>
        </motion.div>
      )}
    </div>
  );
}