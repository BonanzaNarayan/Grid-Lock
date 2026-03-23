"use client";
import { useEffect, useRef, useState } from "react";
import { watchGameMessages }  from "@/lib/gameChatService";
import { GameChatBubble }     from "@/components/room/GameChatBubble";
import { useAuthStore }       from "@/store/useAuthStore";

export function GameChatMessages({ roomId }) {
  const { user }   = useAuthStore();
  const [msgs, setMsgs]   = useState([]);
  const bottomRef  = useRef(null);

  useEffect(() => {
    if (!roomId) return;
    const unsub = watchGameMessages(roomId, setMsgs);
    return () => unsub();
  }, [roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  if (msgs.length === 0) return (
    <div className="flex-1 flex items-center justify-center px-4">
      <p className="font-mono text-[10px] text-muted-foreground tracking-widest text-center leading-relaxed">
        No messages yet.
        <br />Say something!
      </p>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto flex flex-col gap-3 px-4 py-4">
      {msgs.map((msg) => (
        <GameChatBubble
          key={msg.id}
          msg={msg}
          isMe={msg.senderUid === user?.uid}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}