import { db } from "@/lib/firebase";
import {
  collection, doc, addDoc, updateDoc, setDoc,
  query, orderBy, limit, onSnapshot,
  serverTimestamp, arrayUnion, arrayRemove,
} from "firebase/firestore";

export const GROUP_CHATS = [
  {
    id:          "global",
    name:        "Global",
    description: "Chat with everyone on GRIDLOCK",
    icon:        "🌐",
  },
  {
    id:          "tic-tac-toe",
    name:        "Tic-Tac-Toe",
    description: "Talk strategy with TTT players",
    icon:        "✕ ○",
  },
  {
    id:          "connect-four",
    name:        "Connect Four",
    description: "Connect Four chat",
    icon:        "◉ ◉",
  },
];

// ensure group chat docs exist
export async function seedGroupChats() {
  for (const chat of GROUP_CHATS) {
    await setDoc(doc(db, "groupChats", chat.id), {
      name:        chat.name,
      description: chat.description,
      icon:        chat.icon,
      createdAt:   serverTimestamp(),
    }, { merge: true });
  }
}

export async function sendGroupMessage({
  chatId, senderUid, senderName, senderAvatar,
  text, type = "text", roomId = null, roomMeta = null,
  replyTo = null,
}) {
  await addDoc(collection(db, "groupChats", chatId, "messages"), {
    senderUid,
    senderName,
    senderAvatar,
    text:      text    ?? null,
    type,
    roomId:    roomId  ?? null,
    roomMeta:  roomMeta ?? null,
    replyTo:   replyTo ?? null,
    reactions: {},
    deleted:   false,
    createdAt: serverTimestamp(),
  });
}

export async function toggleReaction(chatId, msgId, emoji, uid) {
  const ref      = doc(db, "groupChats", chatId, "messages", msgId);
  const fieldKey = `reactions.${emoji}`;

  // check if user already reacted — we need to read first
  const { getDoc } = await import("firebase/firestore");
  const snap       = await getDoc(ref);
  const current    = snap.data()?.reactions?.[emoji] ?? [];
  const hasReacted = current.includes(uid);

  await updateDoc(ref, {
    [fieldKey]: hasReacted ? arrayRemove(uid) : arrayUnion(uid),
  });
}

export async function deleteGroupMessage(chatId, msgId) {
  await updateDoc(doc(db, "groupChats", chatId, "messages", msgId), {
    deleted: true,
    text:    null,
  });
}

export function watchGroupMessages(chatId, callback, count = 60) {
  const q = query(
    collection(db, "groupChats", chatId, "messages"),
    orderBy("createdAt", "asc"),
    limit(count)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}