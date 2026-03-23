import { db } from "@/lib/firebase";
import {
  collection, addDoc, query,
  orderBy, limit, onSnapshot, serverTimestamp,
} from "firebase/firestore";
import { checkChatAchievement, ACHIEVEMENT_MAP } from "@/lib/achievementService";
import { createNotification } from "@/lib/notificationService";

export async function sendGameMessage({ roomId, senderUid, displayName, text, type = "text" }) {
  await addDoc(collection(db, "rooms", roomId, "chat"), {
    senderUid,
    displayName,
    text,
    type,
    createdAt: serverTimestamp(),
  });

  const chatNewAch = await checkChatAchievement(fromUid);
  for (const id of chatNewAch) {
    const ach = ACHIEVEMENT_MAP[id];
    if (!ach) continue;
    await createNotification(fromUid, {
      type:    "achievement",
      title:   `Achievement Unlocked: ${ach.title}`,
      message: ach.description,
      meta:    { achievementId: id },
    });
  }
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