import { auth } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
} from "firebase/auth";
import { checkUsernameExists, createUserDoc } from "@/lib/userService";

export async function signUp({ email, password, username }) {
  // 1. validate username availability
  const taken = await checkUsernameExists(username);
  if (taken) throw new Error("Username is already taken.");

  // 2. create firebase auth user
  const { user } = await createUserWithEmailAndPassword(auth, email, password);

  // 3. set displayName on auth profile
  await updateProfile(user, { displayName: username.trim() });

  // 4. write user doc to firestore
  await createUserDoc(user.uid, { email, username });

  return user;
}

export async function logIn({ email, password }) {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
}

export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}

export async function logOut() {
  await signOut(auth);
}