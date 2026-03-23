import { db } from "@/lib/firebase";
import { doc, setDoc, onSnapshot, serverTimestamp } from "firebase/firestore";

export async function setPresence(uid, online) {
  await setDoc(doc(db, "presence", uid), {
    online,
    lastSeen: serverTimestamp(),
  }, { merge: true });
}

export function watchPresence(uid, callback) {
  return onSnapshot(doc(db, "presence", uid), (snap) => {
    callback(snap.exists() ? snap.data() : { online: false });
  });
}