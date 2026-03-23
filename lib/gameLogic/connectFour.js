export const CONFIGS = {
  standard: { rows: 6, cols: 7, label: "Standard (6×7)" },
  mini:     { rows: 5, cols: 6, label: "Mini (5×6)"     },
};

export function getConfig(boardSize = "standard") {
  return CONFIGS[boardSize] ?? CONFIGS.standard;
}

export function createBoard(boardSize = "standard") {
  const { rows, cols } = getConfig(boardSize);
  return Array(rows * cols).fill(null);
}

export function getCell(board, row, col, cols) {
  return board[row * cols + col];
}

export function getLowestEmptyRow(board, col, rows, cols) {
  for (let row = rows - 1; row >= 0; row--) {
    if (!getCell(board, row, col, cols)) return row;
  }
  return -1; // column full
}

export function checkWinner(board, boardSize = "standard") {
  const { rows, cols } = getConfig(boardSize);

  function cell(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return null;
    return board[r * cols + c];
  }

  const directions = [
    [0,  1],  // horizontal
    [1,  0],  // vertical
    [1,  1],  // diagonal down-right
    [1, -1],  // diagonal down-left
  ];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const val = cell(r, c);
      if (!val) continue;

      for (const [dr, dc] of directions) {
        const line = [[r, c]];
        for (let i = 1; i < 4; i++) {
          const nr = r + dr * i;
          const nc = c + dc * i;
          if (cell(nr, nc) === val) line.push([nr, nc]);
          else break;
        }
        if (line.length === 4) {
          return {
            winner: val,
            line:   line.map(([lr, lc]) => lr * cols + lc),
          };
        }
      }
    }
  }
  return null;
}

export function isDraw(board, boardSize = "standard") {
  return board.every(Boolean) && !checkWinner(board, boardSize);
}

export function getWinningLine(board, boardSize = "standard") {
  return checkWinner(board, boardSize)?.line ?? null;
}