"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { sendMessage } from "@/lib/chatService";
import { useAuthStore } from "@/store/useAuthStore";
import { Send, Smile, Gamepad2 } from "lucide-react";

const EMOJIS = ["😂","😎","🔥","💀","👑","⚡","🎮","🏆","💪","🤔","😤","🫡","🤯","😈","👾","🤖"];

export function ChatInput({ toUid, chatId, myRooms = [] }) {
  const { user }  = useAuthStore();
  const [text,    setText]    = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showRooms, setShowRooms] = useState(false);
  const [sending, setSending] = useState(false);
  const inputRef  = useRef(null);

  async function handleSend() {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await sendMessage({ fromUid: user.uid, toUid, text: text.trim(), type: "text" });
      setText("");
    } finally { setSending(false); }
  }

  async function handleEmoji(emoji) {
    setText((t) => t + emoji);
    setShowEmoji(false);
    inputRef.current?.focus();
  }

  async function handleRoomInvite(room) {
    setSending(true);
    setShowRooms(false);
    try {
      await sendMessage({
        fromUid:  user.uid,
        toUid,
        text:     null,
        type:     "room_invite",
        roomId:   room.id,
        roomMeta: { gameType: room.gameType, mode: room.mode },
      });
    } finally { setSending(false); }
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  return (
    <div className="relative flex flex-col gap-2 p-3 border-t border-border bg-card">

      {/* emoji picker */}
      <AnimatePresence>
        {showEmoji && (
          <motion.div
            initial={{ opacity: 0, y: 8  }}
            animate={{ opacity: 1, y: 0  }}
            exit={{   opacity: 0, y: 8  }}
            className="absolute bottom-full left-3 mb-2 bg-background border border-border rounded-sm p-3 grid grid-cols-8 gap-1.5 z-10"
          >
            {EMOJIS.map((e) => (
              <button key={e} onClick={() => handleEmoji(e)} className="text-xl hover:scale-125 transition-transform duration-100">
                {e}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* room invite picker */}
      <AnimatePresence>
        {showRooms && (
          <motion.div
            initial={{ opacity: 0, y: 8  }}
            animate={{ opacity: 1, y: 0  }}
            exit={{   opacity: 0, y: 8  }}
            className="absolute bottom-full right-3 mb-2 bg-background border border-border rounded-sm overflow-hidden z-10 w-64"
          >
            <p className="font-mono text-[10px] text-muted-foreground tracking-widest px-3 py-2 border-b border-border">
              INVITE TO ROOM
            </p>
            {myRooms.length === 0 ? (
              <p className="font-mono text-[10px] text-muted-foreground px-3 py-3">
                No open rooms. Create one first.
              </p>
            ) : (
              myRooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => handleRoomInvite(room)}
                  className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-card transition-colors duration-150 border-b border-border last:border-0"
                >
                  <div className="flex flex-col items-start">
                    <span className="font-mono text-xs text-foreground">
                      #{room.id.slice(0, 6).toUpperCase()}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {room.gameType} · {room.mode}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-primary">Invite →</span>
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* input row */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => { setShowEmoji((p) => !p); setShowRooms(false); }}
          className="text-muted-foreground hover:text-primary transition-colors duration-150 shrink-0"
        >
          <Smile size={18} />
        </button>

        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Say something..."
          className="flex-1 bg-background border border-border rounded-sm px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors duration-150"
        />

        <button
          onClick={() => { setShowRooms((p) => !p); setShowEmoji(false); }}
          className="text-muted-foreground hover:text-primary transition-colors duration-150 shrink-0"
          title="Send game invite"
        >
          <Gamepad2 size={18} />
        </button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className="text-primary disabled:text-muted-foreground transition-colors duration-150 shrink-0"
        >
          <Send size={18} />
        </motion.button>
      </div>
    </div>
  );
}