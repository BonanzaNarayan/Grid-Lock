"use client";
import { motion } from "motion/react";

const QUICK_STYLES = {
  "gg":        { bg: "bg-primary/10  border-primary/30  text-primary"     },
  "nice move": { bg: "bg-primary/10  border-primary/30  text-primary"     },
  "lol":       { bg: "bg-accent-game/10 border-accent-game/30 text-accent-game" },
  "ez":        { bg: "bg-destructive/10 border-destructive/30 text-destructive" },
  "rematch?":  { bg: "bg-primary/10  border-primary/30  text-primary"     },
  "noob":      { bg: "bg-destructive/10 border-destructive/30 text-destructive" },
};

export function GameChatBubble({ msg, isMe }) {
  const isQuick = msg.type === "quick";
  const isEmoji = msg.type === "emoji";
  const quickStyle = isQuick ? QUICK_STYLES[msg.text.toLowerCase()] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1    }}
      transition={{ duration: 0.2 }}
      className={`flex flex-col gap-0.5 ${isMe ? "items-end" : "items-start"}`}
    >
      {/* sender name */}
      <span className="font-mono text-[9px] text-muted-foreground px-1 tracking-widest">
        {isMe ? "YOU" : msg.displayName?.toUpperCase()}
      </span>

      {/* bubble */}
      {isEmoji ? (
        <span className="text-3xl select-none">{msg.text}</span>
      ) : isQuick && quickStyle ? (
        <span
          className={`font-mono text-[10px] tracking-widest uppercase border px-3 py-1.5 rounded-sm ${quickStyle.bg}`}
        >
          {msg.text}
        </span>
      ) : (
        <div
          className={`max-w-50 px-3 py-2 rounded-sm font-mono text-xs leading-relaxed wrap-break-word ${
            isMe
              ? "bg-primary text-primary-foreground"
              : "bg-background border border-border text-foreground"
          }`}
        >
          {msg.text}
        </div>
      )}
    </motion.div>
  );
}