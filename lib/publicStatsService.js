import { db } from "@/lib/firebase";
import {
  collection, query, where,
  onSnapshot, getCountFromServer,
} from "firebase/firestore";
import { watchLeaderboard } from "@/lib/statsService";

// live count of finished games
export function watchGamesPlayed(callback) {
  const q = query(
    collection(db, "rooms"),
    where("status", "==", "finished")
  );
  return onSnapshot(q, (snap) => callback(snap.size));
}

// live count of online users
export function watchActivePlayers(callback) {
  const q = query(
    collection(db, "presence"),
    where("online", "==", true)
  );
  return onSnapshot(q, (snap) => callback(snap.size));
}

// live count of open rooms
export function watchOpenRooms(callback) {
  const q = query(
    collection(db, "rooms"),
    where("status", "==", "waiting")
  );
  return onSnapshot(q, (snap) => callback(snap.size));
}

// re-export for convenience
export { watchLeaderboard };