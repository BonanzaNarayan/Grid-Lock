"use client";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { useRouter }        from "next/navigation";
import { useAuthStore }     from "@/store/useAuthStore";
import { GameInput }        from "@/components/ui/GameInput";
import { GlowButton }       from "@/components/ui/GlowButton";
import { deleteAccount }    from "@/lib/settingsService";
import { AlertTriangle }    from "lucide-react";

export function DangerZone() {
  const { logout }  = useAuthStore();
  const router      = useRouter();

  const [confirming,  setConfirming]  = useState(false);
  const [password,    setPassword]    = useState("");
  const [error,       setError]       = useState(null);
  const [loading,     setLoading]     = useState(false);

  async function handleDelete() {
    if (!password) return setError("Password required to confirm deletion.");
    setLoading(true); setError(null);
    try {
      await deleteAccount(password);
      await logout();
      router.replace("/");
    } catch (err) {
      const msg =
        err.code === "auth/wrong-password" ? "Incorrect password."
        : "Failed to delete account. Try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">

      {/* warning banner */}
      <div className="flex items-start gap-3 bg-destructive/10 border border-destructive/30 rounded-sm px-4 py-4">
        <AlertTriangle size={16} className="text-destructive shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1">
          <span className="font-heading text-xs font-black text-destructive tracking-widest">
            DANGER ZONE
          </span>
          <p className="font-sans text-sm text-muted-foreground">
            Deleting your account is permanent. All your stats, game history,
            and profile data will be erased and cannot be recovered.
          </p>
        </div>
      </div>

      {/* delete button — shows confirmation on click */}
      {!confirming ? (
        <GlowButton
          variant="danger"
          className="w-fit"
          onClick={() => setConfirming(true)}
        >
          Delete My Account
        </GlowButton>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, height: 0  }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{   opacity: 0, height: 0  }}
            className="flex flex-col gap-4 overflow-hidden"
          >
            <div className="flex flex-col gap-1">
              <span className="font-heading text-xs font-black text-destructive tracking-widest">
                CONFIRM DELETION
              </span>
              <p className="font-mono text-xs text-muted-foreground">
                Enter your password to permanently delete your account.
              </p>
            </div>

            <GameInput
              label="Your Password"
              id="delete-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null); }}
              error={error}
            />

            <div className="flex gap-3">
              <GlowButton
                variant="danger"
                disabled={loading}
                onClick={handleDelete}
              >
                {loading ? "Deleting..." : "Yes, Delete My Account"}
              </GlowButton>
              <GlowButton
                variant="ghost"
                onClick={() => { setConfirming(false); setPassword(""); setError(null); }}
              >
                Cancel
              </GlowButton>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}