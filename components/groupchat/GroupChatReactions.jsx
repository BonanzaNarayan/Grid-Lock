"use client";
import { motion, AnimatePresence } from "motion/react";
import { useState }                from "react";
import { toggleReaction }          from "@/lib/groupChatService";
import { useAuthStore }            from "@/store/useAuthStore";

const REACTION_EMOJIS = ["👍","😂","🔥","😮","❤️","💀","🎮","👑"];

export function ReactionBar({ chatId, msgId, reactions = {}, isOwn }) {
  const { user }        = useAuthStore();
  const [showPicker, setShowPicker] = useState(false);

  const hasReactions = Object.values(reactions).some((arr) => arr.length > 0);

  async function handleReact(emoji) {
    setShowPicker(false);
    await toggleReaction(chatId, msgId, emoji, user.uid);
  }

  return (
    <div className={`flex items-center gap-1 flex-wrap mt-1 ${isOwn ? "justify-end" : "justify-start"}`}>
      {/* existing reactions */}
      {Object.entries(reactions).map(([emoji, uids]) => {
        if (!uids?.length) return null;
        const reacted = uids.includes(user?.uid);
        return (
          <motion.button
            key={emoji}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleReact(emoji)}
            className={`flex items-center gap-1 font-mono text-[10px] px-1.5 py-0.5 rounded-sm border transition-colors duration-150
              ${reacted
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground hover:border-border-game"}`}
          >
            <span>{emoji}</span>
            <span>{uids.length}</span>
          </motion.button>
        );
      })}

      {/* add reaction button */}
      <div className="relative">
        <button
          onClick={() => setShowPicker((p) => !p)}
          className="font-mono text-[10px] px-1.5 py-0.5 rounded-sm border border-border bg-background text-muted-foreground hover:border-primary hover:text-primary transition-colors duration-150"
        >
          +
        </button>

        <AnimatePresence>
          {showPicker && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 4  }}
              animate={{ opacity: 1, scale: 1,   y: 0  }}
              exit={{   opacity: 0, scale: 0.9,  y: 4  }}
              className={`absolute z-20 bottom-full mb-1 bg-card border border-border rounded-sm p-2 flex gap-1 shadow-xl
                ${isOwn ? "right-0" : "left-0"}`}
            >
              {REACTION_EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => handleReact(e)}
                  className="text-lg hover:scale-125 transition-transform duration-100 w-7 h-7 flex items-center justify-center"
                >
                  {e}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}