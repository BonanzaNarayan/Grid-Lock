import { db } from "@/lib/firebase";
import {
  collection, addDoc, query,
  orderBy, limit, onSnapshot, serverTimestamp,
} from "firebase/firestore";

export async function sendGameMessage({ roomId, senderUid, displayName, text, type = "text" }) {
  await addDoc(collection(db, "rooms", roomId, "chat"), {
    senderUid,
    displayName,
    text,
    type,
    createdAt: serverTimestamp(),
  });
}

export function watchGameMessages(roomId, callback) {
  const q = query(
    collection(db, "rooms", roomId, "chat"),
    orderBy("createdAt", "asc"),
    limit(100)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}