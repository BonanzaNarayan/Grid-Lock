import { db } from "@/lib/firebase";
import {
  collection, addDoc, updateDoc, doc,
  query, where, onSnapshot, serverTimestamp,
} from "firebase/firestore";

export async function sendChallenge({
  fromUid, fromName, toUid, toName, gameType, mode, timerSecs, boardSize,
}) {
  await addDoc(collection(db, "challenges"), {
    fromUid,
    fromName,
    toUid,
    toName,
    gameType,
    mode,
    timerSecs,
    boardSize:  boardSize ?? null,
    status:     "pending",   // "pending" | "accepted" | "declined" | "expired"
    createdAt:  serverTimestamp(),
  });
}

export async function acceptChallenge(challengeId) {
  await updateDoc(doc(db, "challenges", challengeId), { status: "accepted" });
}

export async function declineChallenge(challengeId) {
  await updateDoc(doc(db, "challenges", challengeId), { status: "declined" });
}

export function watchIncomingChallenges(uid, callback) {
  const q = query(
    collection(db, "challenges"),
    where("toUid",  "==", uid),
    where("status", "==", "pending")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}