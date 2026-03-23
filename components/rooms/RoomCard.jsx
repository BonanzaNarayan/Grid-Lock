"use client";
import { motion } from "motion/react";
import { getAvatar } from "@/lib/avatars";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { GlowButton }  from "@/components/ui/GlowButton";
import { Clock, Shield } from "lucide-react";

const MODE_LABELS = {
  bo1: "1 Round",
  bo3: "Best of 3",
  bo5: "Best of 5",
};

export function RoomCard({ room, onJoin, joining, isOwn, index = 0 }) {
  const avatar     = getAvatar(room.players?.X?.avatarId);
  const modeLabel  = MODE_LABELS[room.mode] ?? room.mode;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0  }}
      exit={{   opacity: 0, y: -8  }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.3) }}
      className="relative bg-card border border-border rounded-sm overflow-hidden hover:border-border-game transition-colors duration-150"
    >
      <span className="absolute top-0 left-4 right-4 h-px bg-primary opacity-10" />

      <div className="p-4 flex flex-col gap-3">
        {/* top row — room id + badges */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-primary font-black">
              #{room.id.slice(0, 8).toUpperCase()}
            </span>
            <StatusBadge status={room.status} />
            {room.isPrivate && (
              <span className="inline-flex items-center gap-1 font-mono text-[9px] text-muted-foreground border border-border-game px-1.5 py-0.5 rounded-sm">
                <Shield size={8} />
                PRIVATE
              </span>
            )}
          </div>
          {isOwn && (
            <span className="font-mono text-[9px] text-muted-foreground border border-border-game px-2 py-0.5 rounded-sm tracking-widest">
              YOUR ROOM
            </span>
          )}
        </div>

        {/* creator */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-sm bg-background border border-border flex items-center justify-center text-base shrink-0">
            {avatar.icon}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-mono text-xs text-foreground truncate">
              {room.players?.X?.displayName ?? "Unknown"}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              {room.gameType}
            </span>
          </div>
        </div>

        {/* meta row */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-mono text-[10px] text-muted-foreground border border-border px-2 py-0.5 rounded-sm">
            {modeLabel}
          </span>
          <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
            <Clock size={10} />
            {room.timerSecs}s
          </span>
        </div>

        {/* join button */}
        {onJoin && !isOwn && (
          <GlowButton
            variant="ghost"
            disabled={joining}
            onClick={() => onJoin(room)}
            className="w-full justify-center text-xs py-2 mt-1"
          >
            {joining ? "Joining..." : "Join Room"}
          </GlowButton>
        )}

        {isOwn && (
          <GlowButton
            variant="muted"
            onClick={() => window.open(`/room/${room.id}`, "_blank")}
            className="w-full justify-center text-xs py-2 mt-1"
          >
            Open Room
          </GlowButton>
        )}
      </div>
    </motion.div>
  );
}