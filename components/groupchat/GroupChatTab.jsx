"use client";
import { motion } from "motion/react";
import { GROUP_CHATS } from "@/lib/groupChatService";
import { cn } from "@/lib/utils";

export function GroupChatTab({ active, onChange }) {
  return (
    <div className="flex border-b border-border shrink-0">
      {GROUP_CHATS.map((chat) => {
        const isActive = active === chat.id;
        return (
          <button
            key={chat.id}
            onClick={() => onChange(chat.id)}
            className={cn(
              "relative flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase px-4 py-3 transition-colors duration-150 flex-1 justify-center",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span>{chat.icon}</span>
            <span className="hidden sm:inline">{chat.name}</span>
            {isActive && (
              <motion.span
                layoutId="group-chat-tab"
                className="absolute bottom-0 left-0 right-0 h-px bg-primary"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}