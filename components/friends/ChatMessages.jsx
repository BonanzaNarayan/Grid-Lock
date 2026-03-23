"use client";
import { useEffect, useRef, useState } from "react";
import { watchMessages }               from "@/lib/chatService";
import { useAuthStore }                from "@/store/useAuthStore";
import { motion } from "motion/react";

export function ChatMessages({ chatId, toUser }) {
  const { user }        = useAuthStore();
  const [msgs, setMsgs] = useState([]);
  const bottomRef       = useRef(null);

  useEffect(() => {
    if (!chatId) return;
    // no markRead here — ChatDrawer handles it on open
    const unsub = watchMessages(chatId, setMsgs);
    return () => unsub();
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  if (msgs.length === 0) return (
    <div className="flex-1 flex items-center justify-center">
      <p className="font-mono text-xs text-muted-foreground tracking-widest">
        No messages yet. Say hi!
      </p>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto flex flex-col gap-2 p-4">
      {msgs.map((msg) => {
        const isMe = msg.senderUid === user?.uid;

        // replace the room_invite block inside ChatMessages
        if (msg.type === "room_invite") return (
          <div
            key={msg.id}
            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
          >
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-primary/10 border border-primary/30 rounded-sm overflow-hidden max-w-xs w-full"
            >
              {/* invite header */}
              <div className="flex items-center gap-2 px-3 py-2 border-b border-primary/20 bg-primary/5">
                <span className="text-sm">🎮</span>
                <span className="font-mono text-[10px] text-primary tracking-widest uppercase font-black">
                  Game Invite
                </span>
              </div>

              {/* room details */}
              <div className="px-3 py-3 flex flex-col gap-2">
                <div className="flex flex-col gap-1">
                  {/* room ID */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] text-muted-foreground tracking-widest uppercase">
                      Room ID
                    </span>
                    <span className="font-mono text-xs text-primary font-black">
                      #{msg.roomId?.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                  {/* game type */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] text-muted-foreground tracking-widest uppercase">
                      Game
                    </span>
                    <span className="font-mono text-[10px] text-foreground">
                      {msg.roomMeta?.gameType}
                    </span>
                  </div>
                  {/* mode */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] text-muted-foreground tracking-widest uppercase">
                      Mode
                    </span>
                    <span className="font-mono text-[10px] text-foreground">
                      {msg.roomMeta?.mode === "bo1" ? "1 Round"
                        : msg.roomMeta?.mode === "bo3" ? "Best of 3"
                        : "Best of 5"}
                    </span>
                  </div>
                  {/* timer */}
                  {msg.roomMeta?.timerSecs && (
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] text-muted-foreground tracking-widest uppercase">
                        Timer
                      </span>
                      <span className="font-mono text-[10px] text-foreground">
                        {msg.roomMeta.timerSecs}s per turn
                      </span>
                    </div>
                  )}
                </div>

                {/* join button — only show to the receiver */}
                {!isMe && msg.roomId && (
                  <button
                    onClick={() => window.open(`/room/${msg.roomId}`, "_blank")}
                    className="w-full font-mono text-xs text-primary-foreground bg-primary hover:bg-primary-dim rounded-sm py-2 transition-colors duration-150 font-black tracking-widest uppercase"
                  >
                    Join Room →
                  </button>
                )}

                {/* sender sees a sent indicator instead */}
                {isMe && (
                  <span className="font-mono text-[9px] text-muted-foreground text-center tracking-widest">
                    Invite sent
                  </span>
                )}
              </div>
            </motion.div>
          </div>
        );
        return (
          <div
            key={msg.id}
            className={`flex flex-col gap-0.5 ${isMe ? "items-end" : "items-start"}`}
          >
            <span className="font-mono text-[9px] text-muted-foreground px-1 tracking-widest">
              {isMe ? "YOU" : toUser?.displayUsername?.toUpperCase()}
            </span>
            <div
              className={`max-w-xs px-3 py-2 rounded-sm font-mono text-xs leading-relaxed wrap-break-word ${
                isMe
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-foreground"
              }`}
            >
              {msg.text}
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}