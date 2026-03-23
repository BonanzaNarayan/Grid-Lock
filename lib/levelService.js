export const XP_PER_WIN  = 30;
export const XP_PER_DRAW = 10;
export const XP_PER_LOSS = 5;

export const RANKS = [
  { minLevel: 30, title: "Legend",      icon: "👑", color: "text-yellow-400" },
  { minLevel: 25, title: "Grandmaster", icon: "⚡", color: "text-purple-400" },
  { minLevel: 20, title: "Master",      icon: "🔥", color: "text-orange-400" },
  { minLevel: 15, title: "Elite",       icon: "💎", color: "text-cyan-400"   },
  { minLevel: 10, title: "Veteran",     icon: "🛡️", color: "text-blue-400"   },
  { minLevel: 5,  title: "Challenger",  icon: "⚔️", color: "text-green-400"  },
  { minLevel: 0,  title: "Rookie",      icon: "🎮", color: "text-muted-foreground" },
];

export function getRank(level) {
  return RANKS.find((r) => level >= r.minLevel) ?? RANKS[RANKS.length - 1];
}

export function getLevel(xp = 0) {
  return Math.floor(Math.sqrt(xp / 50));
}

export function getLevelProgress(xp = 0) {
  const level     = getLevel(xp);
  const xpForCurrent = level * level * 50;
  const xpForNext    = (level + 1) * (level + 1) * 50;
  const progress     = ((xp - xpForCurrent) / (xpForNext - xpForCurrent)) * 100;
  const xpNeeded     = xpForNext - xp;
  return { level, progress: Math.round(progress), xpNeeded, xpForNext, xpForCurrent };
}

export function getXPForResult(result) {
  if (result === "win")  return XP_PER_WIN;
  if (result === "draw") return XP_PER_DRAW;
  return XP_PER_LOSS;
}

export function getTotalXP(stats = {}) {
  return Object.values(stats).reduce((total, s) => {
    return total
      + (s.wins   ?? 0) * XP_PER_WIN
      + (s.draws  ?? 0) * XP_PER_DRAW
      + (s.losses ?? 0) * XP_PER_LOSS;
  }, 0);
}