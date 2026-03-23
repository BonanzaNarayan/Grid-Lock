import { db } from "@/lib/firebase";
import {
  doc, collection, query, orderBy, limit,
  onSnapshot, serverTimestamp, setDoc,
  increment, getDoc, writeBatch, where,
  updateDoc,
} from "firebase/firestore";

export function getChatId(uid1, uid2) {
  return [uid1, uid2].sort().join("_");
}

export async function sendMessage({
  fromUid,
  toUid,
  text,
  type     = "text",
  roomId   = null,
  roomMeta = null,
}) {
  const chatId   = getChatId(fromUid, toUid);
  const chatRef  = doc(db, "chats", chatId);
  const msgRef   = doc(collection(db, "chats", chatId, "messages"));
  const batch    = writeBatch(db);

  const lastMessage =
    type === "room_invite" ? "🎮 Game invite" : text;

  // check if chat doc already exists
  const chatSnap = await getDoc(chatRef);

  if (!chatSnap.exists()) {
    // create chat doc and message in one atomic batch
    // this ensures the participants field exists when the
    // message rule does get(chatId)
    batch.set(chatRef, {
      participants:            [fromUid, toUid],
      lastMessage,
      lastMessageAt:           serverTimestamp(),
      unread:                  { [toUid]: 1, [fromUid]: 0 },
    });
  } else {
    // update existing chat doc
    batch.update(chatRef, {
      lastMessage,
      lastMessageAt:           serverTimestamp(),
      [`unread.${toUid}`]:     increment(1),
    });
  }

  // add the message in the same batch
  batch.set(msgRef, {
    senderUid: fromUid,
    text:      text    ?? null,
    type,
    roomId:    roomId  ?? null,
    roomMeta:  roomMeta ?? null,
    createdAt: serverTimestamp(),
  });

  // commit both writes atomically
  await batch.commit();
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