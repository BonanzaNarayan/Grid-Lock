"use client";
import { useState, useRef, useEffect }    from "react";
import { motion, AnimatePresence }         from "motion/react";
import { sendGameMessage }                 from "@/lib/gameChatService";
import { useAuthStore }                    from "@/store/useAuthStore";
import { Send, Smile }                     from "lucide-react";

const EMOJIS = [
  "😂","😎","🔥","💀","👑","⚡","🎮","🏆","💪","🤔",
  "😤","🫡","🤯","😈","👾","🤖","🎯","⚔️","🛡️","🧠",
];

const QUICK_PHRASES = [
  { label: "GG",        text: "gg"        },
  { label: "Nice Move", text: "nice move" },
  { label: "LOL",       text: "lol"       },
  { label: "EZ",        text: "ez"        },
  { label: "Rematch?",  text: "rematch?"  },
  { label: "Noob",      text: "noob"      },
];

export function ChatInput({ toUid, chatId, myRooms = [] }) {
  const { user, profile } = useAuthStore();
  const [text,       setText]       = useState("");
  const [showEmoji,  setShowEmoji]  = useState(false);
  const [showQuick,  setShowQuick]  = useState(false);
  const [sending,    setSending]    = useState(false);
  const inputRef  = useRef(null);
  const wrapperRef = useRef(null);

  // scroll input into view when keyboard opens on iOS
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    function handleFocus() {
      setTimeout(() => {
        wrapperRef.current?.scrollIntoView({
          behavior: "smooth",
          block:    "end",
        });
      }, 300); // wait for keyboard animation
    }

    input.addEventListener("focus", handleFocus);
    return () => input.removeEventListener("focus", handleFocus);
  }, []);

  async function send(payload) {
    if (sending) return;
    setSending(true);
    try {
      await sendMessage({
        fromUid:     user.uid,
        toUid,
        ...payload,
      });
    } finally {
      setSending(false);
    }
  }

  async function handleSend() {
    if (!text.trim()) return;
    await send({ text: text.trim(), type: "text" });
    setText("");
    inputRef.current?.focus();
  }

  async function handleEmoji(emoji) {
    await send({ text: emoji, type: "emoji" });
    setShowEmoji(false);
    inputRef.current?.focus();
  }

  async function handleQuick(phrase) {
    await send({ text: phrase, type: "quick" });
    setShowQuick(false);
    inputRef.current?.focus();
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div
      ref={wrapperRef}
      className="relative flex flex-col gap-0 border-t border-border bg-card shrink-0"
    >
      {/* quick phrases */}
      <AnimatePresence>
        {showQuick && (
          <motion.div
            initial={{ opacity: 0, height: 0      }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{   opacity: 0, height: 0      }}
            className="overflow-hidden border-b border-border"
          >
            <div className="flex flex-wrap gap-1.5 p-3">
              {QUICK_PHRASES.map((p) => (
                <button
                  key={p.text}
                  onClick={() => handleQuick(p.text)}
                  className="font-mono text-[10px] tracking-widest uppercase border border-border-game text-muted-foreground hover:border-primary hover:text-primary px-2.5 py-1 rounded-sm transition-colors duration-150"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* emoji picker */}
      <AnimatePresence>
        {showEmoji && (
          <motion.div
            initial={{ opacity: 0, height: 0      }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{   opacity: 0, height: 0      }}
            className="overflow-hidden border-b border-border"
          >
            <div className="grid grid-cols-10 gap-1 p-3">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => handleEmoji(e)}
                  className="text-xl hover:scale-125 transition-transform duration-100 flex items-center justify-center h-8"
                >
                  {e}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* input row */}
      <div className="flex items-center gap-2 p-3">
        <button
          onClick={() => { setShowEmoji((p) => !p); setShowQuick(false); }}
          className={`transition-colors duration-150 shrink-0 ${
            showEmoji ? "text-primary" : "text-muted-foreground hover:text-primary"
          }`}
        >
          <Smile size={16} />
        </button>

        <button
          onClick={() => { setShowQuick((p) => !p); setShowEmoji(false); }}
          className={`font-mono text-[9px] tracking-widest border rounded-sm px-2 py-1 transition-colors duration-150 shrink-0 ${
            showQuick
              ? "border-primary text-primary bg-primary/10"
              : "border-border-game text-muted-foreground hover:border-primary hover:text-primary"
          }`}
        >
          QUICK
        </button>

        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Say something..."
          maxLength={120}
          className="flex-1 bg-background border border-border rounded-sm px-3 py-1.5 font-mono text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors duration-150 min-w-0"
        />

        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className="text-primary disabled:text-muted-foreground transition-colors duration-150 shrink-0"
        >
          <Send size={16} />
        </motion.button>
      </div>
    </div>
  );
}