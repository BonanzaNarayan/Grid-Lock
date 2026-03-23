"use client";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { PlayerBadge } from "@/components/ui/PlayerBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";

const MOVES = [0, 4, 2, 6, 8]; // X wins diagonal
const X = "X", O = "O";

function buildBoard(moveIndex) {
  const board = Array(9).fill(null);
  for (let i = 0; i <= moveIndex; i++) {
    board[MOVES[i]] = i % 2 === 0 ? X : O;
  }
  return board;
}

const WIN_LINE = [0, 4, 8];

export function GamePreview() {
  const [step, setStep] = useState(-1);

  useEffect(() => {
    if (step >= MOVES.length - 1) {
      const t = setTimeout(() => setStep(-1), 2400);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep((s) => s + 1), step === -1 ? 800 : 900);
    return () => clearTimeout(t);
  }, [step]);

  const board = buildBoard(step);
  const isWon = step === MOVES.length - 1;

  return (
    <section className="py-24 px-6 flex flex-col items-center gap-12">
      {/* heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h2 className="font-heading text-3xl md:text-4xl font-black text-foreground tracking-tight">
          SEE IT IN <span className="text-primary">ACTION</span>
        </h2>
        <p className="font-sans text-muted-foreground mt-3">
          Live game preview — watch a match unfold
        </p>
      </motion.div>

      {/* game window */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full max-w-sm bg-card border border-border rounded-sm overflow-hidden"
      >
        {/* window titlebar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-player-x/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-accent-game/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-primary/60" />
          </div>
          <span className="font-mono text-[10px] text-muted-foreground tracking-widest">
            ROOM #0042
          </span>
          <StatusBadge status={isWon ? "finished" : step >= 0 ? "active" : "waiting"} />
        </div>

        {/* players */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <PlayerBadge player="X" size="sm" />
            <div>
              <p className="font-heading text-xs text-foreground">Player_01</p>
              <p className="font-mono text-[10px] text-muted-foreground">W: 12 L: 4</p>
            </div>
          </div>
          <span className="font-heading text-xs text-muted-foreground">VS</span>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-heading text-xs text-foreground">Player_02</p>
              <p className="font-mono text-[10px] text-muted-foreground">W: 9 L: 7</p>
            </div>
            <PlayerBadge player="O" size="sm" />
          </div>
        </div>

        {/* board */}
        <div className="p-6 flex flex-col items-center gap-4">
          <div className="grid grid-cols-3 gap-2">
            {board.map((cell, i) => {
              const isWinCell = isWon && WIN_LINE.includes(i);
              return (
                <motion.div
                  key={i}
                  className="w-20 h-20 flex items-center justify-center bg-background border border-border rounded-sm"
                  animate={isWinCell ? { borderColor: "var(--primary)", backgroundColor: "color-mix(in srgb, var(--primary) 8%, transparent)" } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {cell && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 18 }}
                      className="font-heading text-3xl font-black"
                      style={{ color: cell === X ? "var(--player-x)" : "var(--player-o)" }}
                    >
                      {cell}
                    </motion.span>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* turn / result indicator */}
          <div className="font-mono text-xs text-muted-foreground tracking-widest h-4">
            {isWon ? (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-primary"
              >
                ✦ PLAYER_01 WINS
              </motion.span>
            ) : step >= 0 ? (
              `${step % 2 === 0 ? "X" : "O"} PLAYED — ${step % 2 === 0 ? "O" : "X"} TO MOVE`
            ) : (
              "MATCH STARTING..."
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}