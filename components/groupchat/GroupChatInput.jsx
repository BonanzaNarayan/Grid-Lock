"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence }     from "motion/react";
import { sendGroupMessage }            from "@/lib/groupChatService";
import { useAuthStore }                from "@/store/useAuthStore";
import { Send, Smile, X, Gamepad2 }   from "lucide-react";
import { db }                          from "@/lib/firebase";
import {
  collection, query, where, onSnapshot,
} from "firebase/firestore";

const EMOJIS = [
  "😂","😎","🔥","💀","👑","⚡","🎮","🏆","💪","🤔",
  "😤","🫡","🤯","😈","👾","🤖","🎯","⚔️","🛡️","🧠",
];

const QUICK_PHRASES = [
  { label: "GG",        text: "gg"        },
  { label: "Nice",      text: "nice move" },
  { label: "LOL",       text: "lol"       },
  { label: "EZ",        text: "ez"        },
  { label: "Let's play",text: "anyone want to play?" },
  { label: "GG WP",    text: "gg wp"     },
];

export function GroupChatInput({ chatId, replyTo, onCancelReply }) {
  const { user, profile }  = useAuthStore();
  const [text,       setText]      = useState("");
  const [showEmoji,  setShowEmoji] = useState(false);
  const [showQuick,  setShowQuick] = useState(false);
  const [showRooms,  setShowRooms] = useState(false);
  const [myRooms,    setMyRooms]   = useState([]);
  const [sending,    setSending]   = useState(false);
  const inputRef   = useRef(null);
  const wrapperRef = useRef(null);

  // fetch open rooms for invite
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "rooms"),
      where("createdBy", "==", user.uid),
      where("status",    "==", "waiting")
    );
    const unsub = onSnapshot(q, (snap) => {
      setMyRooms(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user]);

  async function send(payload) {
    if (sending) return;
    setSending(true);
    try {
      await sendGroupMessage({
        chatId,
        senderUid:    user.uid,
        senderName:   profile.displayUsername,
        senderAvatar: profile.avatarId ?? "controller",
        replyTo:      replyTo ?? null,
        ...payload,
      });
      onCancelReply?.();
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
    setText((t) => t + emoji);
    setShowEmoji(false);
    inputRef.current?.focus();
  }

  async function handleQuick(phrase) {
    await send({ text: phrase, type: "quick" });
    setShowQuick(false);
  }

  async function handleRoomInvite(room) {
    setSending(true);
    setShowRooms(false);
    try {
      await sendGroupMessage({
        chatId,
        senderUid:    user.uid,
        senderName:   profile.displayUsername,
        senderAvatar: profile.avatarId ?? "controller",
        text:         null,
        type:         "room_invite",
        roomId:       room.id,
        roomMeta:     { gameType: room.gameType, mode: room.mode, timerSecs: room.timerSecs },
        replyTo:      replyTo ?? null,
      });
      onCancelReply?.();
    } finally {
      setSending(false);
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
    if (e.key === "Escape") onCancelReply?.();
  }

  return (
    <div ref={wrapperRef} className="flex flex-col border-t border-border bg-card shrink-0">

      {/* reply preview */}
      <AnimatePresence>
        {replyTo && (
          <motion.div
            initial={{ opacity: 0, height: 0   }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{   opacity: 0, height: 0   }}
            className="flex items-center justify-between px-3 py-2 bg-primary/5 border-b border-primary/20 overflow-hidden"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-0.5 h-8 bg-primary rounded-full shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="font-mono text-[10px] text-primary">
                  Replying to {replyTo.senderName}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground truncate max-w-[200px]">
                  {replyTo.text ?? "🎮 Game invite"}
                </span>
              </div>
            </div>
            <button
              onClick={onCancelReply}
              className="text-muted-foreground hover:text-foreground transition-colors duration-150 shrink-0"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* quick phrases */}
      <AnimatePresence>
        {showQuick && (
          <motion.div
            initial={{ opacity: 0, height: 0   }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{   opacity: 0, height: 0   }}
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
            initial={{ opacity: 0, height: 0   }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{   opacity: 0, height: 0   }}
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

      {/* room invite picker */}
      <AnimatePresence>
        {showRooms && (
          <motion.div
            initial={{ opacity: 0, height: 0   }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{   opacity: 0, height: 0   }}
            className="overflow-hidden border-b border-border"
          >
            <div className="flex flex-col">
              <div className="px-4 py-2 border-b border-border bg-background">
                <span className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase">
                  Invite to Room
                </span>
              </div>
              {myRooms.length === 0 ? (
                <p className="font-mono text-[10px] text-muted-foreground px-4 py-3">
                  No open rooms. Create one first.
                </p>
              ) : (
                myRooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => handleRoomInvite(room)}
                    disabled={sending}
                    className="flex items-center justify-between px-4 py-3 hover:bg-background border-b border-border last:border-0 transition-colors duration-150"
                  >
                    <div className="flex flex-col gap-0.5 items-start">
                      <span className="font-mono text-xs text-primary font-black">
                        #{room.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {room.gameType} · {room.mode}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-primary border border-primary/30 bg-primary/10 px-2 py-1 rounded-sm">
                      Invite →
                    </span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* input row */}
      <div className="flex items-center gap-2 p-3">
        <button
          onClick={() => { setShowEmoji((p) => !p); setShowQuick(false); setShowRooms(false); }}
          className={`transition-colors duration-150 shrink-0 ${showEmoji ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
        >
          <Smile size={16} />
        </button>

        <button
          onClick={() => { setShowQuick((p) => !p); setShowEmoji(false); setShowRooms(false); }}
          className={`font-mono text-[9px] tracking-widest border rounded-sm px-2 py-1 transition-colors duration-150 shrink-0
            ${showQuick
              ? "border-primary text-primary bg-primary/10"
              : "border-border-game text-muted-foreground hover:border-primary hover:text-primary"}`}
        >
          QUICK
        </button>

        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder={replyTo ? `Reply to ${replyTo.senderName}...` : "Say something to everyone..."}
          maxLength={300}
          className="flex-1 bg-background border border-border rounded-sm px-3 py-1.5 font-mono text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors duration-150 min-w-0"
        />

        <button
          onClick={() => { setShowRooms((p) => !p); setShowEmoji(false); setShowQuick(false); }}
          className={`relative transition-colors duration-150 shrink-0 ${showRooms ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
          title="Invite to game room"
        >
          <Gamepad2 size={16} />
          {myRooms.length > 0 && (
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary text-primary-foreground font-mono text-[7px] flex items-center justify-center">
              {myRooms.length}
            </span>
          )}
        </button>

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