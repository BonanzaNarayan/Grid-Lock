import { db } from "@/lib/firebase";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

// Check if a username is already taken
export async function checkUsernameExists(username) {
  const q = query(
    collection(db, "users"),
    where("username", "==", username.toLowerCase().trim())
  );
  const snap = await getDocs(q);
  return !snap.empty;
}

// Create user document after signup
export async function createUserDoc(uid, { email, username }) {
  const ref = doc(db, "users", uid);
  await setDoc(ref, {
    uid,
    email,
    username:        username.toLowerCase().trim(),
    displayUsername: username.trim(),
    createdAt:       serverTimestamp(),
    friends:         [],
    playerUids: [uid],
    stats: {
      "tic-tac-toe": { wins: 0, losses: 0, draws: 0 },
    },
  });
}

// Fetch user document
export async function getUserDoc(uid) {
  const ref  = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}