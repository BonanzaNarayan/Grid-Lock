import { create }           from "zustand";
import { auth, db }         from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot }  from "firebase/firestore";
import { logOut }           from "@/lib/authService";

let globalUnsubAuth    = null; // module-level guard — survives re-renders
let globalUnsubProfile = null;

export const useAuthStore = create((set, get) => ({
  user:     null,
  profile:  null,
  loading:  true,

  init() {
    // hard guard — if already initialized at module level, don't run again
    if (globalUnsubAuth) return globalUnsubAuth;

    globalUnsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      // always clean up previous profile listener before creating a new one
      if (globalUnsubProfile) {
        globalUnsubProfile();
        globalUnsubProfile = null;
      }

      if (firebaseUser) {
        set({ user: firebaseUser, loading: true });

        // small delay lets Firestore settle before attaching the snapshot
        // this prevents the double-listener crash on new user creation
        const ref = doc(db, "users", firebaseUser.uid);
        globalUnsubProfile = onSnapshot(
          ref,
          (snap) => {
            set({
              profile: snap.exists() ? snap.data() : null,
              loading: false,
            });
          },
          (error) => {
            // permission errors on new user — doc may not exist yet
            console.warn("Profile snapshot error:", error.code);
            set({ loading: false });
          }
        );
      } else {
        set({ user: null, profile: null, loading: false });
      }
    });

    return globalUnsubAuth;
  },

  async logout() {
    if (globalUnsubProfile) { globalUnsubProfile(); globalUnsubProfile = null; }
    if (globalUnsubAuth)    { globalUnsubAuth();    globalUnsubAuth    = null; }
    await logOut();
    set({ user: null, profile: null, loading: false });
  },
}));