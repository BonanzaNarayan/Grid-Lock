"use client";
import { useEffect, useRef, useState } from "react";
import { motion }                      from "motion/react";
import { watchGroupMessages }          from "@/lib/groupChatService";
import { GroupChatMessage }            from "@/components/groupchat/GroupChatMessage";
import { GroupChatInput }              from "@/components/groupchat/GroupChatInput";
import { useAuthStore }                from "@/store/useAuthStore";

export function GroupChatWindow({ chatId, chatName, chatIcon }) {
  const { user }        = useAuthStore();
  const [msgs, setMsgs] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const bottomRef       = useRef(null);
  const isFirstLoad     = useRef(true);

  useEffect(() => {
    if (!chatId) return;
    const unsub = watchGroupMessages(chatId, (m) => {
      setMsgs(m);
      // only auto-scroll on first load or new message
      if (isFirstLoad.current) {
        isFirstLoad.current = false;
        setTimeout(() => {
          bottomRef.current?.scrollIntoView({ behavior: "instant" });
        }, 50);
      } else {
        // only scroll if near bottom
        const container = bottomRef.current?.parentElement;
        if (container) {
          const isNearBottom =
            container.scrollHeight - container.scrollTop - container.clientHeight < 120;
          if (isNearBottom) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
          }
        }
      }
    });
    return () => { unsub(); isFirstLoad.current = true; };
  }, [chatId]);

  return (
    <div className="flex flex-col h-full">

      {/* chat header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
        <span className="text-xl">{chatIcon}</span>
        <div className="flex flex-col">
          <span className="font-heading text-xs font-black text-foreground tracking-widest">
            {chatName}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">
            {msgs.filter((m) => !m.deleted).length} messages
          </span>
        </div>

        {/* live indicator */}
        <div className="flex items-center gap-1 ml-auto">
          <motion.span
            className="w-1.5 h-1.5 rounded-full bg-primary"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          />
          <span className="font-mono text-[9px] text-muted-foreground">LIVE</span>
        </div>
      </div>

      {/* messages */}
      <div className="flex-1 overflow-y-auto py-3">
        {msgs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <span className="text-3xl">{chatIcon}</span>
            <p className="font-mono text-xs text-muted-foreground tracking-widest text-center">
              No messages yet.
              <br />Be the first to say something!
            </p>
          </div>
        ) : (
          msgs.map((msg, i) => (
            <GroupChatMessage
              key={msg.id}
              msg={msg}
              chatId={chatId}
              onReply={setReplyTo}
              prevSenderId={i > 0 ? msgs[i - 1].senderUid : null}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* input */}
      <GroupChatInput
        chatId={chatId}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
      />
    </div>
  );
}