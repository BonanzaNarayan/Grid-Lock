import { db } from "@/lib/firebase";
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  query, where, getDocs, onSnapshot, serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { notifyFriendAccepted, notifyFriendRequest } from "./notificationService";

export function getChatId(uid1, uid2) {
  return [uid1, uid2].sort().join("_");
}

export async function sendFriendRequest(fromUid, toUid) {
  const q = query(
    collection(db, "friendRequests"),
    where("fromUid", "==", fromUid),
    where("toUid",   "==", toUid)
  );
  const snap = await getDocs(q);
  if (!snap.empty) {
    const existing = snap.docs[0];
    if (existing.data().status === "rejected") {
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

  // get sender's name to include in notification
  const senderSnap = await getDoc(doc(db, "users", fromUid));
  const senderName = senderSnap.data()?.displayUsername ?? "Someone";

  await notifyFriendRequest(toUid, senderName, fromUid);

  return ref;
}

export async function acceptFriendRequest(requestId) {
  const reqSnap = await getDoc(doc(db, "friendRequests", requestId));
  const req     = reqSnap.data();

  await updateDoc(doc(db, "friendRequests", requestId), {
    status: "accepted",
  });

  // notify the original sender that their request was accepted
  const accepterSnap = await getDoc(doc(db, "users", req.toUid));
  const accepter     = accepterSnap.data();

  await notifyFriendAccepted(
    req.fromUid,
    accepter?.displayUsername ?? "Someone",
    accepter?.username ?? "",
  );
}

export async function rejectFriendRequest(requestId) {
  await updateDoc(doc(db, "friendRequests", requestId), {
    status: "rejected",
  });
}

export async function removeFriend(fromUid, toUid) {
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
  const sent     = [];
  const received = [];

  const unsubSent = onSnapshot(
    query(collection(db, "friendRequests"), where("fromUid", "==", uid)),
    (snap) => {
      sent.length = 0;
      snap.docs.forEach((d) => sent.push({ id: d.id, ...d.data() }));
      callback({ sent: [...sent], received: [...received] });
    }
  );

  const unsubReceived = onSnapshot(
    query(collection(db, "friendRequests"), where("toUid", "==", uid)),
    (snap) => {
      received.length = 0;
      snap.docs.forEach((d) => received.push({ id: d.id, ...d.data() }));
      callback({ sent: [...sent], received: [...received] });
    }
  );

  return () => { unsubSent(); unsubReceived(); };
}

// live listener — all users (replaces fetchAllUsers for real-time use)
export function watchAllUsers(callback) {
  return onSnapshot(
    query(collection(db, "users")),
    (snap) => {
      callback(snap.docs.map((d) => ({ uid: d.id, ...d.data() })));
    }
  );
}

// one-time fetch — keep this if anything else uses it
export async function fetchAllUsers() {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
}