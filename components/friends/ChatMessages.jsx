"use client";
import { useEffect, useRef, useState } from "react";
import { watchMessages }               from "@/lib/chatService";
import { useAuthStore }                from "@/store/useAuthStore";

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

        if (msg.type === "room_invite") return (
          <div
            key={msg.id}
            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
          >
            <div className="bg-primary/10 border border-primary/30 rounded-sm px-4 py-3 flex flex-col gap-2 max-w-xs">
              <span className="font-mono text-[10px] text-primary tracking-widest">
                🎮 GAME INVITE
              </span>
              <span className="font-mono text-xs text-foreground">
                {msg.roomMeta?.gameType} · {msg.roomMeta?.mode}
              </span>
              {!isMe && (
                <button
                  onClick={() => window.open(`/room/${msg.roomId}`, "_blank")}
                  className="font-mono text-[10px] text-primary border border-primary/30 px-3 py-1.5 rounded-sm hover:bg-primary/10 transition-colors duration-150 text-left"
                >
                  Join Room →
                </button>
              )}
            </div>
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