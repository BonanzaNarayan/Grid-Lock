"use client";
import { motion, AnimatePresence }    from "motion/react";
import { useEffect, useState }        from "react";
import { X }                          from "lucide-react";
import { getChatId, markRead }        from "@/lib/chatService";
import { useAuthStore }               from "@/store/useAuthStore";
import { ChatMessages }               from "@/components/friends/ChatMessages";
import { ChatInput }                  from "@/components/friends/ChatInput";
import { PresenceDot }                from "@/components/friends/PresenceDot";
import { getAvatar }                  from "@/lib/avatars";
import { db }                         from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export function ChatDrawer({ friend, onClose }) {
  const { user }          = useAuthStore();
  const [myRooms, setMyRooms] = useState([]);
  const chatId            = friend ? getChatId(user.uid, friend.uid) : null;
  const avatar            = getAvatar(friend?.avatarId);

  // ── mark as read the moment the drawer opens ──
  useEffect(() => {
    if (!chatId || !user?.uid) return;
    // fire immediately on open — don't wait for messages to load
    markRead(chatId, user.uid);
  }, [chatId, user?.uid]);

  // fetch user's open rooms for invite feature
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

  return (
    <AnimatePresence>
      {friend && (
        <>
          {/* backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{   opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm md:hidden"
          />

          {/* drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0       }}
            exit={{   x: "100%"   }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-background border-l border-border flex flex-col shadow-2xl"
          >
            {/* header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-sm bg-card border border-border flex items-center justify-center text-lg">
                    {avatar.icon}
                  </div>
                  <PresenceDot uid={friend.uid} className="absolute -bottom-0.5 -right-0.5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-mono text-xs text-foreground">
                    {friend.displayUsername}
                  </span>
                  {friend.gamerTag && (
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {friend.gamerTag}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors duration-150"
              >
                <X size={18} />
              </button>
            </div>

            {/* messages */}
            <ChatMessages chatId={chatId} toUser={friend} />

            {/* input */}
            <ChatInput toUid={friend.uid} chatId={chatId} myRooms={myRooms} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}