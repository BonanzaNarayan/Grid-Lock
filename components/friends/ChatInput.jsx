"use client";
import { useState, useRef, useEffect }  from "react";
import { motion, AnimatePresence }       from "motion/react";
import { sendMessage }                   from "@/lib/chatService";
import { useAuthStore }                  from "@/store/useAuthStore";
import { Send, Smile, Gamepad2 }         from "lucide-react";

const EMOJIS = [
  "😂","😎","🔥","💀","👑","⚡","🎮","🏆","💪","🤔",
  "😤","🫡","🤯","😈","👾","🤖","🎯","⚔️","🛡️","🧠",
];

export function ChatInput({ toUid, chatId, myRooms = [] }) {
  const { user, profile }  = useAuthStore();
  const [text,       setText]       = useState("");
  const [showEmoji,  setShowEmoji]  = useState(false);
  const [showRooms,  setShowRooms]  = useState(false);
  const [sending,    setSending]    = useState(false);
  const inputRef   = useRef(null);
  const wrapperRef = useRef(null);

  // scroll input into view when keyboard opens on iOS
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    function handleFocus() {
      setTimeout(() => {
        wrapperRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 300);
    }
    input.addEventListener("focus", handleFocus);
    return () => input.removeEventListener("focus", handleFocus);
  }, []);

  async function send(payload) {
    if (sending) return;
    setSending(true);
    try {
      await sendMessage({
        fromUid: user.uid,
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

  // send the room invite with the actual room ID
  async function handleRoomInvite(room) {
    setSending(true);
    setShowRooms(false);
    try {
      await sendMessage({
        fromUid:  user.uid,
        toUid,
        text:     null,
        type:     "room_invite",
        roomId:   room.id,                          // ← actual Firestore room ID
        roomMeta: {
          gameType: room.gameType,
          mode:     room.mode,
          timerSecs: room.timerSecs,
        },
      });
    } finally {
      setSending(false);
    }
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

      {/* ── emoji picker ─────────────────────────────── */}
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

      {/* ── room invite picker ────────────────────────── */}
      <AnimatePresence>
        {showRooms && (
          <motion.div
            initial={{ opacity: 0, height: 0      }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{   opacity: 0, height: 0      }}
            className="overflow-hidden border-b border-border"
          >
            <div className="flex flex-col">
              {/* header */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background">
                <span className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase">
                  Invite to Room
                </span>
                <span className="font-mono text-[9px] text-muted-foreground">
                  Your open rooms
                </span>
              </div>

              {/* room list */}
              {myRooms.length === 0 ? (
                <div className="px-4 py-4 flex flex-col gap-1">
                  <p className="font-mono text-xs text-muted-foreground">
                    No open rooms available.
                  </p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    Create a room from the dashboard first.
                  </p>
                </div>
              ) : (
                myRooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => handleRoomInvite(room)}
                    disabled={sending}
                    className="flex items-center justify-between px-4 py-3 hover:bg-background border-b border-border last:border-0 transition-colors duration-150 text-left disabled:opacity-50"
                  >
                    <div className="flex flex-col gap-0.5">
                      {/* room ID prominently shown */}
                      <span className="font-mono text-xs text-primary font-black">
                        #{room.id.slice(0, 8).toUpperCase()}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {room.gameType}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground">·</span>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {room.mode === "bo1" ? "1 Round"
                            : room.mode === "bo3" ? "Best of 3"
                            : "Best of 5"}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground">·</span>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {room.timerSecs}s timer
                        </span>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-primary border border-primary/30 bg-primary/10 px-2 py-1 rounded-sm shrink-0">
                      Invite →
                    </span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── input row ─────────────────────────────────── */}
      <div className="flex items-center gap-2 p-3">

        {/* emoji toggle */}
        <button
          onClick={() => { setShowEmoji((p) => !p); setShowRooms(false); }}
          className={`transition-colors duration-150 shrink-0 ${
            showEmoji ? "text-primary" : "text-muted-foreground hover:text-primary"
          }`}
          title="Emoji"
        >
          <Smile size={16} />
        </button>

        {/* text input */}
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Say something..."
          maxLength={120}
          className="flex-1 bg-background border border-border rounded-sm px-3 py-1.5 font-mono text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors duration-150 min-w-0"
        />

        {/* room invite toggle */}
        <button
          onClick={() => { setShowRooms((p) => !p); setShowEmoji(false); }}
          className={`transition-colors duration-150 shrink-0 relative ${
            showRooms ? "text-primary" : "text-muted-foreground hover:text-primary"
          }`}
          title="Invite to game room"
        >
          <Gamepad2 size={16} />
          {/* badge if rooms available */}
          {myRooms.length > 0 && (
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary text-primary-foreground font-mono text-[7px] flex items-center justify-center">
              {myRooms.length}
            </span>
          )}
        </button>

        {/* send button */}
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