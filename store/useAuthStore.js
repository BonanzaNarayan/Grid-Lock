import { create } from "zustand";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { logOut } from "@/lib/authService";

export const useAuthStore = create((set, get) => ({
  user:        null, // firebase auth user
  profile:     null, // firestore user doc
  loading:     true,
  unsubProfile: null,

  // call once in a top-level provider
  init() {
  // prevent duplicate listeners
  if (get().unsubAuth) return get().unsubAuth;

  const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
    // clean up previous profile listener before creating a new one
    get().unsubProfile?.();

    if (firebaseUser) {
      set({ user: firebaseUser });
      const ref   = doc(db, "users", firebaseUser.uid);
      const unsub = onSnapshot(ref, (snap) => {
        set({ profile: snap.exists() ? snap.data() : null, loading: false });
      });
      set({ unsubProfile: unsub });
    } else {
      set({ user: null, profile: null, loading: false, unsubProfile: null });
    }
  });

  set({ unsubAuth });
  return unsubAuth;
},

  async logout() {
    get().unsubProfile?.();
    await logOut();
  },
}));