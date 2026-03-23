"use client";
import { motion, AnimatePresence } from "motion/react";
import { getWinningLine } from "@/lib/gameLogic/ticTacToe";

export function TicTacToe({ board, currentTurn, myMark, status, onMove }) {
  const winLine = getWinningLine(board);
  const canMove = status === "active" && currentTurn === myMark;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="grid grid-cols-3 gap-2">
        {board.map((cell, i) => {
          const isWinCell  = winLine?.includes(i);
          const isPlayable = canMove && !cell;

          return (
            <motion.button
              key={i}
              onClick={() => isPlayable && onMove(i)}
              disabled={!isPlayable}
              whileHover={isPlayable ? { scale: 1.04 } : {}}
              whileTap={isPlayable   ? { scale: 0.96 } : {}}
              animate={
                isWinCell
                  ? { borderColor: "var(--primary)", backgroundColor: "color-mix(in srgb, var(--primary) 12%, transparent)" }
                  : { borderColor: "var(--border)",  backgroundColor: "var(--background)" }
              }
              transition={{ duration: 0.25 }}
              className="w-24 h-24 md:w-28 md:h-28 flex items-center justify-center border rounded-sm relative overflow-hidden cursor-pointer disabled:cursor-default"
            >
              {/* hover ghost */}
              {isPlayable && (
                <span
                  className="absolute inset-0 flex items-center justify-center font-heading text-4xl font-black opacity-0 hover:opacity-20 transition-opacity duration-150"
                  style={{ color: myMark === "X" ? "var(--player-x)" : "var(--player-o)" }}
                >
                  {myMark}
                </span>
              )}

              <AnimatePresence>
                {cell && (
                  <motion.span
                    key={cell + i}
                    initial={{ scale: 0, rotate: -12, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0,   opacity: 1 }}
                    exit={{   scale: 0, rotate:  12,  opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 22 }}
                    className="font-heading text-4xl md:text-5xl font-black select-none"
                    style={{ color: cell === "X" ? "var(--player-x)" : "var(--player-o)" }}
                  >
                    {cell}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}