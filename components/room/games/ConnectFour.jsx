"use client";
import { motion, AnimatePresence } from "motion/react";
import { useMemo, useState }       from "react";
import {
  getConfig,
  getLowestEmptyRow,
  getWinningLine,
} from "@/lib/gameLogic/connectFour";

// column hover indicator
function ColIndicator({ active, mark }) {
  return (
    <div className="flex items-center justify-center h-6">
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0  }}
            exit={{   opacity: 0, y: -6  }}
            transition={{ duration: 0.15 }}
            className="w-4 h-4 rounded-full"
            style={{
              background: mark === "X"
                ? "var(--player-x)"
                : "var(--player-o)",
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// single cell
function Cell({ value, isWin, isDropping, rowIndex, mark }) {
  const color =
    value === "X" ? "var(--player-x)"
    : value === "O" ? "var(--player-o)"
    : "transparent";

  return (
    <motion.div
      className="relative flex items-center justify-center rounded-full"
      style={{ aspectRatio: "1" }}
      animate={
        isWin
          ? {
              boxShadow: [
                `0 0 0px 0px ${color}`,
                `0 0 16px 4px ${color}`,
                `0 0 0px 0px ${color}`,
              ],
            }
          : {}
      }
      transition={
        isWin
          ? { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
          : {}
      }
    >
      <AnimatePresence>
        {value && (
          <motion.div
            key={`${value}-${rowIndex}`}
            className="absolute inset-0.5 rounded-full"
            style={{ background: color }}
            initial={{ y: isDropping ? "-400%" : 0, opacity: isDropping ? 0.6 : 1 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              type:      "spring",
              stiffness: 300,
              damping:   28,
              duration:  0.4,
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function ConnectFour({ board, currentTurn, myMark, status, onMove, boardSize = "standard" }) {
  const { rows, cols }  = getConfig(boardSize);
  const [hoverCol, setHoverCol] = useState(null);
  const [lastDrop, setLastDrop] = useState(null); // { col, row } of most recent drop

  const winLine  = useMemo(() => getWinningLine(board, boardSize), [board, boardSize]);
  const canMove  = status === "active" && currentTurn === myMark;

  function handleColClick(col) {
    if (!canMove) return;
    const row = getLowestEmptyRow(board, col, rows, cols);
    if (row === -1) return; // column full
    setLastDrop({ col, row });
    onMove({ col, row, index: row * cols + col });
  }

  // build grid rows for rendering
  const grid = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({
      value: board[r * cols + c],
      index: r * cols + c,
      row:   r,
      col:   c,
    }))
  );

  return (
    <div
      className="flex flex-col items-center gap-1 select-none"
      onMouseLeave={() => setHoverCol(null)}
    >
      {/* column hover indicators */}
      <div
        className="grid gap-1 w-full"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {Array.from({ length: cols }, (_, c) => (
          <ColIndicator key={c} active={hoverCol === c && canMove} mark={myMark} />
        ))}
      </div>

      {/* board */}
      <div
        className="relative bg-card border border-border rounded-sm p-2 w-full"
        style={{
          background: "var(--card)",
          boxShadow:  "inset 0 2px 8px rgba(0,0,0,0.4)",
        }}
      >
        {/* column click zones */}
        <div
          className="absolute inset-0 grid z-10"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {Array.from({ length: cols }, (_, c) => {
            const row    = getLowestEmptyRow(board, c, rows, cols);
            const isOpen = canMove && row !== -1;
            return (
              <div
                key={c}
                className={isOpen ? "cursor-pointer" : "cursor-default"}
                onMouseEnter={() => isOpen && setHoverCol(c)}
                onClick={() => handleColClick(c)}
              />
            );
          })}
        </div>

        {/* cells grid */}
        <div
          className="grid gap-1.5"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {grid.map((row) =>
            row.map(({ value, index, row: r, col: c }) => {
              const isWin      = winLine?.includes(index) ?? false;
              const isDropping = lastDrop?.col === c && lastDrop?.row === r && !!value;
              return (
                <div
                  key={index}
                  className="bg-background rounded-full overflow-hidden"
                  style={{ aspectRatio: "1" }}
                >
                  <Cell
                    value={value}
                    isWin={isWin}
                    isDropping={isDropping}
                    rowIndex={r}
                    mark={value === "X" ? "X" : "O"}
                  />
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* column numbers — helps on mobile */}
      <div
        className="grid gap-1 w-full"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {Array.from({ length: cols }, (_, c) => (
          <span
            key={c}
            className="font-mono text-[9px] text-muted-foreground text-center"
          >
            {c + 1}
          </span>
        ))}
      </div>
    </div>
  );
}