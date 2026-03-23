"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Copy, Check, LogOut } from "lucide-react";
import { GlowButton } from "@/components/ui/GlowButton";
import { StatusBadge } from "@/components/ui/StatusBadge";

export function RoomHeader({ roomId, status, onForfeit }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3">
        <span className="font-heading text-sm font-black text-foreground tracking-widest">
          ROOM
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 font-mono text-xs text-muted-foreground border border-border-game px-3 py-1.5 rounded-sm hover:border-primary hover:text-primary transition-colors duration-150"
        >
          <span>#{roomId.slice(0, 8).toUpperCase()}</span>
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                <Check size={12} className="text-primary" />
              </motion.span>
            ) : (
              <motion.span key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                <Copy size={12} />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
        <StatusBadge status={status} />
      </div>

      {status !== "finished" && (
        <GlowButton variant="danger" className="text-xs py-1.5 px-4" onClick={onForfeit}>
          <LogOut size={13} className="mr-1.5" />
          Forfeit
        </GlowButton>
      )}
    </div>
  );
}