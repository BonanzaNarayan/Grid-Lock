import { db } from "@/lib/firebase";
import {
  doc, collection, query, orderBy, limit,
  onSnapshot, serverTimestamp, setDoc,
  increment, getDoc, writeBatch, where,
  updateDoc,
} from "firebase/firestore";
import { createNotification, notifyNewMessage, notifyRoomInvite } from "@/lib/notificationService";
import { useNotificationStore }               from "@/store/useNotificationStore";
import { ACHIEVEMENT_MAP, checkChatAchievement } from "./achievementService";

export function getChatId(uid1, uid2) {
  return [uid1, uid2].sort().join("_");
}

export async function sendMessage({
  fromUid, toUid, text, type = "text", roomId = null, roomMeta = null,
}) {
  const chatId  = getChatId(fromUid, toUid);
  const chatRef = doc(db, "chats", chatId);
  const msgRef  = doc(collection(db, "chats", chatId, "messages"));
  const batch   = writeBatch(db);

  const lastMessage = type === "room_invite" ? "🎮 Game invite" : text;

  const chatSnap = await getDoc(chatRef);
  if (!chatSnap.exists()) {
    batch.set(chatRef, {
      participants:  [fromUid, toUid],
      lastMessage,
      lastMessageAt: serverTimestamp(),
      unread:        { [toUid]: 1, [fromUid]: 0 },
    });
  } else {
    batch.update(chatRef, {
      lastMessage,
      lastMessageAt:        serverTimestamp(),
      [`unread.${toUid}`]:  increment(1),
    });
  }

  batch.set(msgRef, {
    senderUid: fromUid,
    text:      text    ?? null,
    type,
    roomId:    roomId  ?? null,
    roomMeta:  roomMeta ?? null,
    createdAt: serverTimestamp(),
  });

  await batch.commit();
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

  // get sender name for notification
  const senderSnap = await getDoc(doc(db, "users", fromUid));
  const senderName = senderSnap.data()?.displayUsername ?? "Someone";

  // only notify if the recipient doesn't have this chat open
  const isChatOpen = useNotificationStore.getState().isChatOpen(fromUid);
  if (!isChatOpen) {
    if (type === "room_invite") {
      await notifyRoomInvite(toUid, senderName, roomId, roomMeta?.gameType);
    } else {
      await notifyNewMessage(toUid, senderName, fromUid, text);
    }
  }
}

export async function markRead(chatId, uid) {
  try {
    const chatRef = doc(db, "chats", chatId);
    const snap    = await getDoc(chatRef);
    if (!snap.exists()) return;

    const unread = snap.data()?.unread?.[uid] ?? 0;
    if (unread === 0) return;

    // updateDoc with dot notation correctly zeros the nested field
    await updateDoc(chatRef, {
      [`unread.${uid}`]: 0,
    });
  } catch {
    // never break the UI over a read receipt
  }
}

export function watchMessages(chatId, callback) {
  const q = query(
    collection(db, "chats", chatId, "messages"),
    orderBy("createdAt", "asc"),
    limit(100)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export function watchChats(uid, callback) {
  const q = query(
    collection(db, "chats"),
    where("participants", "array-contains", uid)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}