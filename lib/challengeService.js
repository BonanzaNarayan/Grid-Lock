import { db } from "@/lib/firebase";
import {
  collection, addDoc, updateDoc, doc,
  query, where, onSnapshot, serverTimestamp,
} from "firebase/firestore";
import { checkSocialAchievements, ACHIEVEMENT_MAP } from "@/lib/achievementService";
import { createNotification } from "@/lib/notificationService";

export async function sendChallenge({ fromUid, fromName, toUid, toName, gameType, mode, timerSecs, boardSize }) {
  const ref = await addDoc(collection(db, "challenges"), {
    fromUid, fromName, toUid, toName,
    gameType, mode,
    timerSecs:  timerSecs ?? 30,
    boardSize:  boardSize ?? null,
    status:     "pending",
    createdAt:  serverTimestamp(),
  });

  // check challenger achievement
  const newAch = await checkSocialAchievements(fromUid, {
    friendCount:      0,
    hasSentChallenge: true,
  });
  for (const id of newAch) {
    const ach = ACHIEVEMENT_MAP[id];
    if (!ach) continue;
    await createNotification(fromUid, {
      type:    "achievement",
      title:   `Achievement Unlocked: ${ach.title}`,
      message: ach.description,
      meta:    { achievementId: id },
    });
  }

  return ref;
}

// updated — stores roomId so challenger can navigate to it
export async function acceptChallenge(challengeId, roomId) {
  await updateDoc(doc(db, "challenges", challengeId), {
    status: "accepted",
    roomId,
  });
}

export async function declineChallenge(challengeId) {
  await updateDoc(doc(db, "challenges", challengeId), {
    status: "declined",
  });
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

// challenger watches for their challenge to be accepted
export function watchSentChallenge(challengeId, callback) {
  return onSnapshot(doc(db, "challenges", challengeId), (snap) => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() });
  });
}