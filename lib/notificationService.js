import { db } from "@/lib/firebase";
import {
  collection, addDoc, updateDoc, doc,
  query, orderBy, limit, onSnapshot,
  where, writeBatch, serverTimestamp,
} from "firebase/firestore";

export async function createNotification(uid, {
  type, title, message, link = null, meta = null,
}) {
  try {
    await addDoc(collection(db, "notifications", uid, "items"), {
      type,
      title,
      message,
      link,
      meta,
      read:      false,
      createdAt: serverTimestamp(),
    });
  } catch {
    // never crash the app over a notification failure
  }
}

export async function markNotificationRead(uid, notifId) {
  try {
    await updateDoc(
      doc(db, "notifications", uid, "items", notifId),
      { read: true }
    );
  } catch {}
}

export async function markAllRead(uid, items) {
  try {
    const batch = writeBatch(db);
    items
      .filter((n) => !n.read)
      .forEach((n) => {
        batch.update(
          doc(db, "notifications", uid, "items", n.id),
          { read: true }
        );
      });
    await batch.commit();
  } catch {}
}

export function watchNotifications(uid, callback) {
  const q = query(
    collection(db, "notifications", uid, "items"),
    orderBy("createdAt", "desc"),
    limit(30)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

// ── convenience helpers ──────────────────────────────────────────

export async function notifyFriendRequest(toUid, fromName, fromUid) {
  await createNotification(toUid, {
    type:    "friend_request",
    title:   "Friend Request",
    message: `${fromName} sent you a friend request.`,
    link:    "/dashboard/friends?tab=requests",
    meta:    { fromUid },
  });
}

export async function notifyFriendAccepted(toUid, fromName, fromUsername) {
  await createNotification(toUid, {
    type:    "friend_accepted",
    title:   "Friend Request Accepted",
    message: `${fromName} accepted your friend request.`,
    link:    `/player/${fromUsername}`,
    meta:    { fromUsername },
  });
}

export async function notifyNewMessage(toUid, fromName, fromUid, preview) {
  await createNotification(toUid, {
    type:    "new_message",
    title:   "New Message",
    message: `${fromName}: ${preview?.slice(0, 50) ?? "sent you a message"}`,
    link:    "/dashboard/friends?tab=friends",
    meta:    { fromUid },
  });
}

export async function notifyRoomInvite(toUid, fromName, roomId, gameType) {
  await createNotification(toUid, {
    type:    "room_invite",
    title:   "Game Room Invite",
    message: `${fromName} invited you to a ${gameType} room.`,
    link:    null,
    meta:    { roomId, fromName, gameType },
  });
}

export async function notifyRoomJoined(toUid, joinerName, roomId, gameType) {
  await createNotification(toUid, {
    type:    "room_joined",
    title:   "Opponent Joined",
    message: `${joinerName} joined your ${gameType} room. Game on!`,
    link:    null,
    meta:    { roomId, gameType },
  });
}

export async function notifyLevelUp(uid, newLevel, rankTitle) {
  await createNotification(uid, {
    type:    "level_up",
    title:   "Level Up!",
    message: `You reached Level ${newLevel} — ${rankTitle}!`,
    link:    null,
    meta:    { newLevel, rankTitle },
  });
}