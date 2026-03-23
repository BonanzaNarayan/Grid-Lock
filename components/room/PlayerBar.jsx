"use client";
import { motion } from "motion/react";
import { PlayerBadge } from "@/components/ui/PlayerBadge";
import { MoveTimer }   from "@/components/room/MoveTimer";

export function PlayerBar({ room, myMark, onTimerExpire }) {
  const { players, currentTurn, scores, status, timerSecs, turnStartedAt } = room;
  const isActive = status === "active";

  function Side({ mark }) {
    const player   = players?.[mark];
    const isActive = currentTurn === mark && status === "active";
    const score    = scores?.[mark] ?? 0;

    return (
      <motion.div
        animate={{ opacity: player ? 1 : 0.4 }}
        className={`flex items-center gap-3 flex-1 ${mark === "O" ? "flex-row-reverse" : ""}`}
      >
        <PlayerBadge player={mark} size="sm" />
        <div className={`flex flex-col ${mark === "O" ? "items-end" : "items-start"}`}>
          <span className="font-mono text-xs text-foreground truncate max-w-25">
            {player?.displayName ?? "Waiting..."}
          </span>
          <span className="font-heading text-lg font-black text-primary leading-none">
            {score}
          </span>
        </div>
        {isActive && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="font-mono text-[9px] text-primary tracking-widest"
          >
            YOUR TURN
          </motion.span>
        )}
      </motion.div>
    );
  }

  return (
    <div className="flex items-center gap-4 bg-card border border-border rounded-sm px-4 py-3">
      <Side mark="X" />

      {/* center — timer or VS */}
      <div className="flex flex-col items-center gap-1 shrink-0">
        {isActive && turnStartedAt ? (
          <MoveTimer
            timerSecs={timerSecs}
            turnStartedAt={turnStartedAt}
            isMyTurn={currentTurn === myMark}
            onExpire={onTimerExpire}
          />
        ) : (
          <span className="font-heading text-xs text-muted-foreground tracking-widest">VS</span>
        )}
        <span className="font-mono text-[9px] text-muted-foreground tracking-widest">
          {room.mode === "bo1" ? "1 ROUND" : room.mode === "bo3" ? "BEST OF 3" : "BEST OF 5"}
          {" · "}RD {room.round}
        </span>
      </div>

      <Side mark="O" />
    </div>
  );
}