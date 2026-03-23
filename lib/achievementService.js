import { db } from "@/lib/firebase";
import {
  collection, doc, setDoc, getDocs,
  serverTimestamp, getDoc,
} from "firebase/firestore";

// ── achievement definitions ──────────────────────────────────────
export const ACHIEVEMENTS = [

  // milestones
  {
    id:          "first-blood",
    title:       "First Blood",
    description: "Win your first game.",
    icon:        "🏆",
    category:    "Milestones",
    rarity:      "common",
  },
  {
    id:          "veteran-10",
    title:       "Veteran",
    description: "Win 10 games.",
    icon:        "⚔️",
    category:    "Milestones",
    rarity:      "common",
  },
  {
    id:          "unstoppable",
    title:       "Unstoppable",
    description: "Win 50 games.",
    icon:        "🔥",
    category:    "Milestones",
    rarity:      "rare",
  },
  {
    id:          "centurion",
    title:       "Centurion",
    description: "Win 100 games.",
    icon:        "💯",
    category:    "Milestones",
    rarity:      "epic",
  },
  {
    id:          "legend-wins",
    title:       "Living Legend",
    description: "Win 500 games.",
    icon:        "👑",
    category:    "Milestones",
    rarity:      "legendary",
  },

  // streaks
  {
    id:          "hot-streak",
    title:       "Hot Streak",
    description: "Win 3 games in a row.",
    icon:        "🌶️",
    category:    "Streaks",
    rarity:      "common",
  },
  {
    id:          "on-fire",
    title:       "On Fire",
    description: "Win 5 games in a row.",
    icon:        "🔥",
    category:    "Streaks",
    rarity:      "rare",
  },
  {
    id:          "untouchable",
    title:       "Untouchable",
    description: "Win 10 games in a row.",
    icon:        "⚡",
    category:    "Streaks",
    rarity:      "legendary",
  },

  // special
  {
    id:          "clean-sweep",
    title:       "Clean Sweep",
    description: "Win a match without your opponent scoring a single point.",
    icon:        "🧹",
    category:    "Special",
    rarity:      "rare",
  },
  {
    id:          "comeback-king",
    title:       "Comeback King",
    description: "Win a match after trailing in a Best of 3 or Best of 5.",
    icon:        "🔄",
    category:    "Special",
    rarity:      "epic",
  },

  // social
  {
    id:          "social-butterfly",
    title:       "Social Butterfly",
    description: "Add your first friend.",
    icon:        "🦋",
    category:    "Social",
    rarity:      "common",
  },
  {
    id:          "challenger",
    title:       "The Challenger",
    description: "Send your first challenge.",
    icon:        "⚔️",
    category:    "Social",
    rarity:      "common",
  },
  {
    id:          "popular",
    title:       "Popular",
    description: "Have 10 friends.",
    icon:        "👥",
    category:    "Social",
    rarity:      "rare",
  },

  // variety
  {
    id:          "multi-gamer",
    title:       "Multi-Gamer",
    description: "Play all available game types.",
    icon:        "🎮",
    category:    "Variety",
    rarity:      "rare",
  },

  // chat
  {
    id:          "chatterbox",
    title:       "Chatterbox",
    description: "Send your first message.",
    icon:        "💬",
    category:    "Chat",
    rarity:      "common",
  },

  // level
  {
    id:          "rising-star",
    title:       "Rising Star",
    description: "Reach Level 5.",
    icon:        "⭐",
    category:    "Level",
    rarity:      "common",
  },
  {
    id:          "elite-player",
    title:       "Elite Player",
    description: "Reach Level 10.",
    icon:        "💎",
    category:    "Level",
    rarity:      "rare",
  },
  {
    id:          "grandmaster-rank",
    title:       "Grandmaster",
    description: "Reach Level 20.",
    icon:        "🧠",
    category:    "Level",
    rarity:      "epic",
  },
  {
    id:          "legend-rank",
    title:       "Legend",
    description: "Reach Level 30.",
    icon:        "🌟",
    category:    "Level",
    rarity:      "legendary",
  },
];

export const ACHIEVEMENT_MAP = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.id, a])
);

export const RARITY_STYLES = {
  common:    { border: "border-border",          bg: "bg-card",           label: "text-muted-foreground", glow: ""                          },
  rare:      { border: "border-blue-500/40",     bg: "bg-blue-500/5",     label: "text-blue-400",         glow: "shadow-blue-500/20"         },
  epic:      { border: "border-purple-500/40",   bg: "bg-purple-500/5",   label: "text-purple-400",       glow: "shadow-purple-500/20"       },
  legendary: { border: "border-yellow-400/60",   bg: "bg-yellow-400/5",   label: "text-yellow-400",       glow: "shadow-yellow-400/30"       },
};

// ── unlock an achievement ────────────────────────────────────────
export async function unlockAchievement(uid, achievementId) {
  const ref  = doc(db, "users", uid, "achievements", achievementId);
  const snap = await getDoc(ref);
  if (snap.exists()) return false; // already unlocked

  await setDoc(ref, {
    id:         achievementId,
    unlockedAt: serverTimestamp(),
    notified:   false,
  });
  return true; // newly unlocked
}

// ── get all unlocked achievements for a user ─────────────────────
export async function getUserAchievements(uid) {
  const snap = await getDocs(collection(db, "users", uid, "achievements"));
  return snap.docs.map((d) => d.data());
}

// ── check all achievements after a game finishes ─────────────────
export async function checkGameAchievements(uid, { stats, streak, room }) {
  const newlyUnlocked = [];

  const totalWins = Object.values(stats ?? {}).reduce(
    (sum, s) => sum + (s.wins ?? 0), 0
  );

  // milestone checks
  if (totalWins >= 1)   if (await unlockAchievement(uid, "first-blood"))   newlyUnlocked.push("first-blood");
  if (totalWins >= 10)  if (await unlockAchievement(uid, "veteran-10"))    newlyUnlocked.push("veteran-10");
  if (totalWins >= 50)  if (await unlockAchievement(uid, "unstoppable"))   newlyUnlocked.push("unstoppable");
  if (totalWins >= 100) if (await unlockAchievement(uid, "centurion"))     newlyUnlocked.push("centurion");
  if (totalWins >= 500) if (await unlockAchievement(uid, "legend-wins"))   newlyUnlocked.push("legend-wins");

  // streak checks
  if (streak >= 3)  if (await unlockAchievement(uid, "hot-streak"))    newlyUnlocked.push("hot-streak");
  if (streak >= 5)  if (await unlockAchievement(uid, "on-fire"))       newlyUnlocked.push("on-fire");
  if (streak >= 10) if (await unlockAchievement(uid, "untouchable"))   newlyUnlocked.push("untouchable");

  // clean sweep — winner scored all, opponent scored 0
  if (room) {
    const { scores, mode, players } = room;
    const isX        = players?.X?.uid === uid;
    const myMark     = isX ? "X" : "O";
    const oppMark    = isX ? "O" : "X";
    const maxWins    = mode === "bo1" ? 1 : mode === "bo3" ? 2 : 3;
    const iWon       = (scores?.[myMark] ?? 0) >= maxWins;
    const oppScored  = (scores?.[oppMark] ?? 0) > 0;

    if (iWon && !oppScored && mode !== "bo1") {
      if (await unlockAchievement(uid, "clean-sweep")) newlyUnlocked.push("clean-sweep");
    }

    // comeback king — won after being behind
    if (iWon && (scores?.[oppMark] ?? 0) > 0 && mode !== "bo1") {
      if (await unlockAchievement(uid, "comeback-king")) newlyUnlocked.push("comeback-king");
    }
  }

  // game variety — played all game types
  const playedTypes = Object.entries(stats ?? {})
    .filter(([, s]) => (s.wins ?? 0) + (s.losses ?? 0) + (s.draws ?? 0) > 0)
    .map(([gt]) => gt);
  const allTypes = ["tic-tac-toe", "connect-four"];
  if (allTypes.every((t) => playedTypes.includes(t))) {
    if (await unlockAchievement(uid, "multi-gamer")) newlyUnlocked.push("multi-gamer");
  }

  return newlyUnlocked;
}

export async function checkLevelAchievements(uid, level) {
  const newlyUnlocked = [];
  if (level >= 5)  if (await unlockAchievement(uid, "rising-star"))      newlyUnlocked.push("rising-star");
  if (level >= 10) if (await unlockAchievement(uid, "elite-player"))     newlyUnlocked.push("elite-player");
  if (level >= 20) if (await unlockAchievement(uid, "grandmaster-rank")) newlyUnlocked.push("grandmaster-rank");
  if (level >= 30) if (await unlockAchievement(uid, "legend-rank"))      newlyUnlocked.push("legend-rank");
  return newlyUnlocked;
}

export async function checkSocialAchievements(uid, { friendCount, hasSentChallenge }) {
  const newlyUnlocked = [];
  if (friendCount >= 1)  if (await unlockAchievement(uid, "social-butterfly")) newlyUnlocked.push("social-butterfly");
  if (friendCount >= 10) if (await unlockAchievement(uid, "popular"))          newlyUnlocked.push("popular");
  if (hasSentChallenge)  if (await unlockAchievement(uid, "challenger"))        newlyUnlocked.push("challenger");
  return newlyUnlocked;
}

export async function checkChatAchievement(uid) {
  const newlyUnlocked = [];
  if (await unlockAchievement(uid, "chatterbox")) newlyUnlocked.push("chatterbox");
  return newlyUnlocked;
}