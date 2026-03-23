import { db } from "@/lib/firebase";
import {
  collection, query, where, orderBy,
  getDocs, limit, onSnapshot,
} from "firebase/firestore";

export const GAME_TYPES = ["tic-tac-toe", "connect-four"];

// live leaderboard for a game type
export function watchLeaderboard(gameType, callback) {
  const q = query(collection(db, "users"));
  return onSnapshot(q, (snap) => {
    const players = snap.docs
      .map((d) => ({ uid: d.id, ...d.data() }))
      .filter((p) => p.stats?.[gameType])
      .map((p) => {
        const s      = p.stats[gameType];
        const total  = (s.wins ?? 0) + (s.losses ?? 0) + (s.draws ?? 0);
        const rate   = total ? Math.round(((s.wins ?? 0) / total) * 100) : 0;
        return {
          uid:            p.uid,
          displayUsername: p.displayUsername,
          avatarId:       p.avatarId,
          gamerTag:       p.gamerTag,
          wins:           s.wins   ?? 0,
          losses:         s.losses ?? 0,
          draws:          s.draws  ?? 0,
          total,
          rate,
        };
      })
      .filter((p) => p.total > 0)
      .sort((a, b) => b.wins - a.wins || b.rate - a.rate);
    callback(players);
  });
}

// compute winning streak from finished rooms
export async function getStreakData(uid) {
  const q = query(
    collection(db, "rooms"),
    where("status",     "==",             "finished"),
    where("playerUids", "array-contains", uid),
  );
  const snap  = await getDocs(q);
  const rooms = snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((r) => r.finishedAt)
    .sort((a, b) => a.finishedAt.toMillis() - b.finishedAt.toMillis());

  let current = 0, best = 0, temp = 0;

  for (const room of rooms) {
    const isX      = room.players?.X?.uid === uid;
    const myMark   = isX ? "X" : "O";
    const mode     = room.mode ?? "bo1";
    const maxWins  = mode === "bo1" ? 1 : mode === "bo3" ? 2 : 3;
    const matchWinner =
      room.scores?.X >= maxWins ? "X"
      : room.scores?.O >= maxWins ? "O"
      : "draw";
    const won = matchWinner === myMark;

    if (won)  { temp++; best = Math.max(best, temp); }
    else      { temp = 0; }
  }
  current = temp;
  return { current, best };
}

// win rate history — last N finished rooms grouped by day
export async function getWinRateHistory(uid, days = 30) {
  const q = query(
    collection(db, "rooms"),
    where("status",     "==",             "finished"),
    where("playerUids", "array-contains", uid),
  );
  const snap  = await getDocs(q);
  const rooms = snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((r) => r.finishedAt)
    .sort((a, b) => a.finishedAt.toMillis() - b.finishedAt.toMillis());

  // bucket by day
  const buckets = {};
  const now     = Date.now();

  for (const room of rooms) {
    const ms   = room.finishedAt.toMillis();
    if (now - ms > days * 86400000) continue;
    const day  = new Date(ms).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (!buckets[day]) buckets[day] = { wins: 0, total: 0, day };

    const isX       = room.players?.X?.uid === uid;
    const myMark    = isX ? "X" : "O";
    const mode      = room.mode ?? "bo1";
    const maxWins   = mode === "bo1" ? 1 : mode === "bo3" ? 2 : 3;
    const matchWinner =
      room.scores?.X >= maxWins ? "X"
      : room.scores?.O >= maxWins ? "O"
      : "draw";

    buckets[day].total++;
    if (matchWinner === myMark) buckets[day].wins++;
  }

  return Object.values(buckets).map((b) => ({
    day:  b.day,
    rate: b.total ? Math.round((b.wins / b.total) * 100) : 0,
    wins: b.wins,
    total: b.total,
  }));
}