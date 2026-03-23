"use client";
import { useEffect }        from "react";
import { useAuthStore }     from "@/store/useAuthStore";
import { setPresence }      from "@/lib/presenceService";

// initialize once at module level — completely immune to StrictMode double-invoke
// this runs when the module is first imported, before any component mounts
const unsubAuth = useAuthStore.getState().init();

export function AuthProvider({ children }) {
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user) return;

    // set online
    setPresence(user.uid, true);

    // set offline when tab closes
    function handleUnload() {
      setPresence(user.uid, false);
    }
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [user?.uid]);

  return <>{children}</>;
}