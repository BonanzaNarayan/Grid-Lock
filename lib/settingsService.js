import { auth, db } from "@/lib/firebase";
import {
  updatePassword,
  updateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
} from "firebase/auth";
import {
  doc, updateDoc, deleteDoc,
  collection, query, where, getDocs,
} from "firebase/firestore";
import { checkUsernameExists } from "@/lib/userService";

// update profile fields (avatar, username, bio, gamerTag)
export async function updateProfileSettings(uid, { avatarId, username, bio, gamerTag, currentUsername }) {
  // only check username if it changed
  if (username.toLowerCase().trim() !== currentUsername.toLowerCase().trim()) {
    const taken = await checkUsernameExists(username);
    if (taken) throw new Error("Username is already taken.");
  }

  const ref = doc(db, "users", uid);
  await updateDoc(ref, {
    avatarId,
    username:        username.toLowerCase().trim(),
    displayUsername: username.trim(),
    bio:             bio.trim(),
    gamerTag:        gamerTag.trim(),
  });
}

// re-authenticate then update email
export async function updateUserEmail(currentPassword, newEmail) {
  const user       = auth.currentUser;
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updateEmail(user, newEmail);
  await updateDoc(doc(db, "users", user.uid), { email: newEmail });
}

// re-authenticate then update password
export async function updateUserPassword(currentPassword, newPassword) {
  const user       = auth.currentUser;
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
}

// re-authenticate then delete account + user doc
export async function deleteAccount(currentPassword) {
  const user       = auth.currentUser;
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await deleteDoc(doc(db, "users", user.uid));
  await deleteUser(user);
}