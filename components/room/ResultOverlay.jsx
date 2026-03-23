"use client";
import { motion, AnimatePresence } from "motion/react";
import { GlowButton }   from "@/components/ui/GlowButton";
import { PlayerBadge }  from "@/components/ui/PlayerBadge";
import { useRouter }    from "next/navigation";

export function ResultOverlay({ room, myMark, onRematch, rematchVoted }) {
  const router   = useRouter();
  const { winner, scores, players, mode, rematchVotes } = room;

  const maxWins     = mode === "bo1" ? 1 : mode === "bo3" ? 2 : 3;
  const matchWinner =
    scores?.X >= maxWins ? "X"
    : scores?.O >= maxWins ? "O"
    : winner === "draw" ? "draw"
    : null;

  if (!matchWinner) return null;

  const isDraw  = matchWinner === "draw";
  const iWon    = matchWinner === myMark;
  const opponentVoted = rematchVotes?.[myMark === "X" ? "O" : "X"];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 16 }}
          animate={{ scale: 1,   opacity: 1, y: 0  }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          className="relative bg-card border border-border rounded-sm p-8 flex flex-col items-center gap-6 max-w-xs w-full mx-4"
        >
          <span className="absolute top-0 left-6 right-6 h-px bg-primary opacity-40" />

          {/* result */}
          <div className="flex flex-col items-center gap-2">
            {isDraw ? (
              <span className="font-heading text-3xl font-black text-muted-foreground">DRAW</span>
            ) : (
              <>
                <PlayerBadge player={matchWinner} size="lg" />
                <span className={`font-heading text-2xl font-black ${iWon ? "text-primary" : "text-destructive"}`}>
                  {iWon ? "YOU WIN!" : "YOU LOSE"}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {players?.[matchWinner]?.displayName} wins the match
                </span>
              </>
            )}
          </div>

          {/* score */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="font-mono text-[10px] text-muted-foreground">
                {players?.X?.displayName ?? "X"}
              </p>
              <p className="font-heading text-2xl font-black text-player-x">{scores?.X ?? 0}</p>
            </div>
            <span className="font-heading text-sm text-muted-foreground">—</span>
            <div className="text-center">
              <p className="font-mono text-[10px] text-muted-foreground">
                {players?.O?.displayName ?? "O"}
              </p>
              <p className="font-heading text-2xl font-black text-player-o">{scores?.O ?? 0}</p>
            </div>
          </div>

          {/* actions */}
          <div className="flex flex-col gap-3 w-full">
            {rematchVoted ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="font-mono text-xs text-center text-primary tracking-widest"
              >
                {opponentVoted ? "STARTING REMATCH..." : "WAITING FOR OPPONENT..."}
              </motion.p>
            ) : (
              <GlowButton onClick={onRematch} className="w-full justify-center">
                Rematch
              </GlowButton>
            )}
            <GlowButton
              variant="ghost"
              className="w-full justify-center"
              onClick={() => router.push("/dashboard")}
            >
              Back to Lobby
            </GlowButton>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}