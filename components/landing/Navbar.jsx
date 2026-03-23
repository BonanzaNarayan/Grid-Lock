"use client";
import { motion }        from "motion/react";
import { useRouter }     from "next/navigation";
import { GlowButton }    from "@/components/ui/GlowButton";
import { useAuthModal }  from "@/store/useAuthModal";
import { useAuthStore }  from "@/store/useAuthStore";

export function Navbar() {
  const { open }   = useAuthModal();
  const { user }   = useAuthStore();
  const router     = useRouter();

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0   }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm"
      style={{
        paddingTop:   "env(safe-area-inset-top)",
        paddingLeft:  "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      }}
    >
      <div className="flex items-center justify-between px-6 md:px-12 py-4">
        {/* logo */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => router.push("/")}
        >
          <span className="font-heading text-xl font-black text-primary tracking-widest">
            GRIDLOCK
          </span>
          <span className="hidden sm:block font-mono text-[10px] text-muted-foreground tracking-widest border border-border-game px-1.5 py-0.5 rounded-sm">
            BETA
          </span>
        </div>

        {/* nav links — desktop */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => router.push("/rooms")}
            className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors duration-150 px-3 py-1.5 tracking-widest uppercase"
          >
            Rooms
          </button>
          <button
            onClick={() => router.push("/leaderboard")}
            className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors duration-150 px-3 py-1.5 tracking-widest uppercase"
          >
            Leaderboard
          </button>
        </nav>

        {/* actions */}
        {user ? (
          // authenticated — single Play button
          <GlowButton
            variant="primary"
            onClick={() => router.push("/dashboard")}
            className="text-xs py-2 px-6"
          >
            Play Now →
          </GlowButton>
        ) : (
          // unauthenticated — login + signup
          <div className="flex items-center gap-3">
            <GlowButton
              variant="ghost"
              onClick={() => open("login")}
              className="text-xs py-2 px-4"
            >
              Login
            </GlowButton>
            <GlowButton
              variant="primary"
              onClick={() => open("signup")}
              className="text-xs py-2 px-4"
            >
              Sign Up
            </GlowButton>
          </div>
        )}
      </div>
    </motion.nav>
  );
}