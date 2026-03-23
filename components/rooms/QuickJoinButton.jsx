"use client";
import { motion } from "motion/react";
import { useState } from "react";
import { useAuthStore }  from "@/store/useAuthStore";
import { joinRoom }      from "@/lib/roomService";
import { Zap }           from "lucide-react";

export function QuickJoinButton({ rooms }) {
  const { user, profile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  // available rooms — not created by me, not private, waiting
  const available = rooms.filter(
    (r) => r.status === "waiting"
      && !r.isPrivate
      && r.players?.X?.uid !== user?.uid
  );

  async function handleQuickJoin() {
    if (!available.length) return;
    setLoading(true);
    setError(null);

    // pick a random room
    const room = available[Math.floor(Math.random() * available.length)];

    try {
      await joinRoom({ roomId: room.id, user, profile });
      window.open(`/room/${room.id}`, "_blank");
    } catch (err) {
      // room got taken — try next one if available
      const remaining = available.filter((r) => r.id !== room.id);
      if (remaining.length > 0) {
        const fallback = remaining[Math.floor(Math.random() * remaining.length)];
        try {
          await joinRoom({ roomId: fallback.id, user, profile });
          window.open(`/room/${fallback.id}`, "_blank");
          return;
        } catch {}
      }
      setError(err.message ?? "No rooms available right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <motion.button
        onClick={handleQuickJoin}
        disabled={loading || !available.length}
        whileHover={{ scale: loading || !available.length ? 1 : 1.02 }}
        whileTap={{   scale: loading || !available.length ? 1 : 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="relative flex items-center justify-center gap-2.5 bg-primary text-primary-foreground font-heading text-sm font-black tracking-widest uppercase px-8 py-4 rounded-sm disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden"
      >
        {/* animated bg pulse when available */}
        {available.length > 0 && !loading && (
          <motion.span
            className="absolute inset-0 bg-white/10"
            animate={{ opacity: [0, 0.15, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        <Zap size={16} className={loading ? "animate-pulse" : ""} />
        {loading
          ? "Finding room..."
          : available.length > 0
          ? `Quick Join (${available.length} open)`
          : "No Rooms Available"}
      </motion.button>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-mono text-[10px] text-destructive text-center"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}