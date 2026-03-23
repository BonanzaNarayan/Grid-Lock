import { db } from "@/lib/firebase";
import {
  collection, addDoc, query,
  orderBy, limit, onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

export async function logActivity(uid, { type, message, gameType = null }) {
  try {
    await addDoc(collection(db, "activity", uid, "feed"), {
      type,
      message,
      gameType,
      createdAt: serverTimestamp(),
    });
  } catch {
    // never crash the app over an activity log failure
  }
}

export function watchActivity(uid, callback, count = 20) {
  const q = query(
    collection(db, "activity", uid, "feed"),
    orderBy("createdAt", "desc"),
    limit(count)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}