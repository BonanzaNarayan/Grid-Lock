import { db } from "@/lib/firebase";
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  query, where, getDocs, onSnapshot, serverTimestamp,
} from "firebase/firestore";

export function getChatId(uid1, uid2) {
  return [uid1, uid2].sort().join("_");
}

export async function sendFriendRequest(fromUid, toUid) {
  // check no existing request
  const q = query(
    collection(db, "friendRequests"),
    where("fromUid", "==", fromUid),
    where("toUid",   "==", toUid)
  );
  const snap = await getDocs(q);
  if (!snap.empty) {
    const existing = snap.docs[0];
    if (existing.data().status === "rejected") {
      // allow re-send if previously rejected
      await updateDoc(doc(db, "friendRequests", existing.id), {
        status:    "pending",
        createdAt: serverTimestamp(),
      });
      return;
    }
    throw new Error("Request already sent.");
  }
  await addDoc(collection(db, "friendRequests"), {
    fromUid,
    toUid,
    status:    "pending",
    createdAt: serverTimestamp(),
  });
}

export async function acceptFriendRequest(requestId) {
  await updateDoc(doc(db, "friendRequests", requestId), {
    status: "accepted",
  });
}

export async function rejectFriendRequest(requestId) {
  await updateDoc(doc(db, "friendRequests", requestId), {
    status: "rejected",
  });
}

export async function removeFriend(fromUid, toUid) {
  // find and delete the request doc in both directions
  for (const [a, b] of [[fromUid, toUid], [toUid, fromUid]]) {
    const q    = query(
      collection(db, "friendRequests"),
      where("fromUid", "==", a),
      where("toUid",   "==", b),
      where("status",  "==", "accepted")
    );
    const snap = await getDocs(q);
    snap.docs.forEach((d) => deleteDoc(d.ref));
  }
}

// live listener — all requests involving this user
export function watchFriendRequests(uid, callback) {
  const qSent = query(
    collection(db, "friendRequests"),
    where("fromUid", "==", uid)
  );
  const qReceived = query(
    collection(db, "friendRequests"),
    where("toUid", "==", uid)
  );

  const sent     = [];
  const received = [];

  const unsubSent = onSnapshot(qSent, (snap) => {
    sent.length = 0;
    snap.docs.forEach((d) => sent.push({ id: d.id, ...d.data() }));
    callback({ sent: [...sent], received: [...received] });
  });

  const unsubReceived = onSnapshot(qReceived, (snap) => {
    received.length = 0;
    snap.docs.forEach((d) => received.push({ id: d.id, ...d.data() }));
    callback({ sent: [...sent], received: [...received] });
  });

  return () => { unsubSent(); unsubReceived(); };
}

// live listener — all users (for Find Friends)
export function watchAllUsers(callback) {
  const q = query(collection(db, "users"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ uid: d.id, ...d.data() })));
  });
}