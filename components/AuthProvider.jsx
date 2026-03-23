"use client";
import { useEffect } from "react";
import { useAuthStore }  from "@/store/useAuthStore";
import { setPresence }   from "@/lib/presenceService";

export function AuthProvider({ children }) {
  const init = useAuthStore((s) => s.init);

  useEffect(() => {
    const unsub = init();

    // set online on mount
    const unsubAuth = useAuthStore.subscribe(
      (s) => s.user,
      (user) => {
        if (user) {
          setPresence(user.uid, true);
          // set offline on tab close
          window.addEventListener("beforeunload", () => setPresence(user.uid, false));
        }
      }
    );

    return () => {
      unsub?.();
      unsubAuth?.();
    };
  }, [init]);

  return <>{children}</>;
}