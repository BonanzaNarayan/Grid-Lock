"use client";
import { motion, AnimatePresence } from "motion/react";
import { useMemo, useState }       from "react";
import {
  getConfig,
  getLowestEmptyRow,
  getWinningLine,
} from "@/lib/gameLogic/connectFour";

function Cell({ value, isWin, isDropping, rowIndex }) {
  const color =
    value === "X" ? "var(--player-x)"
    : value === "O" ? "var(--player-o)"
    : "transparent";

  return (
    <motion.div
      className="relative w-full flex items-center justify-center"
      style={{ aspectRatio: "1" }}
      animate={
        isWin
          ? {
              boxShadow: [
                `0 0 0px  0px ${color}`,
                `0 0 16px 4px ${color}`,
                `0 0 0px  0px ${color}`,
              ],
            }
          : { boxShadow: "none" }
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
            key={`piece-${rowIndex}-${value}`}
            className="absolute rounded-full"
            style={{
              inset:      "8%",
              background: color,
            }}
            initial={{ y: isDropping ? "-500%" : 0, opacity: isDropping ? 0.7 : 1 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              type:      "spring",
              stiffness: 280,
              damping:   26,
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function ConnectFour({
  board,
  currentTurn,
  myMark,
  status,
  onMove,
  boardSize = "standard",
}) {
  const { rows, cols }      = getConfig(boardSize);
  const [hoverCol, setHoverCol] = useState(null);
  const [lastDrop, setLastDrop] = useState(null);

  const winLine = useMemo(
    () => getWinningLine(board, boardSize),
    [board, boardSize]
  );
  const canMove = status === "active" && currentTurn === myMark;

  function handleColClick(col) {
    if (!canMove) return;
    const row = getLowestEmptyRow(board, col, rows, cols);
    if (row === -1) return;
    setLastDrop({ col, row });
    onMove({ col, row, index: row * cols + col });
  }

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
      className="flex flex-col gap-0 w-full select-none"
      onMouseLeave={() => setHoverCol(null)}
    >
      {/* ── hover indicator row — FIXED height, always rendered ── */}
      <div
        className="grid w-full"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          height: "28px",        // fixed height — never changes
          gap:    "6px",
          padding: "0 2px",
        }}
      >
        {Array.from({ length: cols }, (_, c) => (
          <div
            key={c}
            className="flex items-center justify-center"
          >
            {/* piece preview — opacity transition only, no height change */}
            <motion.div
              className="w-4 h-4 rounded-full"
              animate={{
                opacity: hoverCol === c && canMove ? 1 : 0,
                scale:   hoverCol === c && canMove ? 1 : 0.5,
              }}
              transition={{ duration: 0.12 }}
              style={{
                background: myMark === "X"
                  ? "var(--player-x)"
                  : "var(--player-o)",
                pointerEvents: "none",
              }}
            />
          </div>
        ))}
      </div>

      {/* ── board ── */}
      <div
        className="relative rounded-sm overflow-hidden w-full"
        style={{
          background: "var(--card)",
          border:     "1px solid var(--border)",
          padding:    "6px",
          boxShadow:  "inset 0 2px 10px rgba(0,0,0,0.35)",
        }}
      >
        {/* invisible column click zones on top */}
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
                style={{ cursor: isOpen ? "pointer" : "default" }}
                onMouseEnter={() => canMove && row !== -1 && setHoverCol(c)}
                onClick={() => handleColClick(c)}
              />
            );
          })}
        </div>

        {/* cells */}
        <div
          className="grid w-full"
          style={{
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: "6px",
          }}
        >
          {grid.map((row) =>
            row.map(({ value, index, row: r, col: c }) => {
              const isWin      = winLine?.includes(index) ?? false;
              const isDropping =
                lastDrop?.col === c && lastDrop?.row === r && !!value;
              return (
                <div
                  key={index}
                  className="rounded-full overflow-hidden"
                  style={{
                    aspectRatio: "1",
                    background:  "var(--background)",
                  }}
                >
                  <Cell
                    value={value}
                    isWin={isWin}
                    isDropping={isDropping}
                    rowIndex={r}
                  />
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── column numbers — FIXED height, always rendered ── */}
      <div
        className="grid w-full"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          height: "20px",        // fixed height — never changes
          gap:    "6px",
          padding: "2px 2px 0",
        }}
      >
        {Array.from({ length: cols }, (_, c) => (
          <span
            key={c}
            className="font-mono text-center"
            style={{
              fontSize:   "9px",
              color:      "var(--muted-foreground)",
              lineHeight: "1",
            }}
          >
            {c + 1}
          </span>
        ))}
      </div>
    </div>
  );
}