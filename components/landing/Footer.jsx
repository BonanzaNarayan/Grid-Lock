"use client";
import { useAuthModal } from "@/store/useAuthModal";

export function Footer() {
  const { open } = useAuthModal();

  return (
    <footer className="border-t border-border bg-background px-6 md:px-12 py-10">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">

        {/* brand */}
        <div className="flex flex-col items-center md:items-start gap-1">
          <span className="font-heading text-lg font-black text-primary tracking-widest">
            GRIDLOCK
          </span>
          <span className="font-mono text-[10px] text-muted-foreground tracking-widest">
            ONLINE GAME ARENA
          </span>
        </div>

        {/* links */}
        <div className="flex items-center gap-6">
          {["About", "Privacy", "Terms"].map((link) => (
            <button
              key={link}
              className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors duration-150 tracking-widest"
            >
              {link}
            </button>
          ))}
          <button
            onClick={() => open("signup")}
            className="font-mono text-xs text-primary hover:text-accent-game transition-colors duration-150 tracking-widest"
          >
            Sign Up Free →
          </button>
        </div>

        {/* copyright */}
        <p className="font-mono text-[10px] text-muted-foreground tracking-widest">
          © {new Date().getFullYear()} GRIDLOCK. ALL RIGHTS RESERVED.
        </p>
      </div>
    </footer>
  );
}