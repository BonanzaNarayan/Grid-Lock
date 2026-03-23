"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter }           from "next/navigation";
import { motion }              from "motion/react";
import { useAuthStore }        from "@/store/useAuthStore";
import { seedGroupChats }      from "@/lib/groupChatService";
import { GroupChatTab }        from "@/components/groupchat/GroupChatTab";
import { GroupChatWindow }     from "@/components/groupchat/GroupChatWindow";
import { GROUP_CHATS }         from "@/lib/groupChatService";

export default function GroupChatPage() {
  const { user, loading } = useAuthStore();
  const router            = useRouter();
  const [active, setActive] = useState("global");
  const seeded = useRef(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [user, loading]);

  // seed group chat docs once
  useEffect(() => {
    if (user && !seeded.current) {
      seeded.current = true;
      seedGroupChats();
    }
  }, [user]);

  const activeChat = GROUP_CHATS.find((c) => c.id === active);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <motion.div
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 1.2, repeat: Infinity }}
        className="w-2 h-2 rounded-full bg-primary"
      />
    </div>
  );

  return (
    <div className="relative flex flex-col h-screen md:h-[calc(100vh-0px)]">
      {/* scanlines */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, var(--primary) 2px, var(--primary) 3px)",
          backgroundSize: "100% 3px",
        }}
      />

      <div className="relative z-10 flex flex-col h-full max-w-4xl mx-auto w-full px-4 md:px-8 py-4 gap-0">

        {/* page header */}
        <div className="pb-4 shrink-0">
          <h1 className="font-heading text-2xl font-black text-foreground tracking-tight">
            COMMUNITY <span className="text-primary">CHAT</span>
          </h1>
          <p className="font-mono text-xs text-muted-foreground tracking-widest mt-1">
            CHAT WITH ALL GRIDLOCK PLAYERS
          </p>
        </div>

        {/* chat card */}
        <div className="relative bg-card border border-border rounded-sm overflow-hidden flex flex-col flex-1 min-h-0">
          <span className="absolute top-0 left-6 right-6 h-px bg-primary opacity-20 z-10" />

          {/* tabs */}
          <GroupChatTab active={active} onChange={setActive} />

          {/* chat window */}
          <div className="flex-1 min-h-0">
            <GroupChatWindow
              key={active}
              chatId={activeChat?.id}
              chatName={activeChat?.name}
              chatIcon={activeChat?.icon}
            />
          </div>
        </div>

      </div>
    </div>
  );
}