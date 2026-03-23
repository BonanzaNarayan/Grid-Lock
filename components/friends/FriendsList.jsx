"use client";
import { useState }              from "react";
import { motion }                from "motion/react";
import { useAuthStore }          from "@/store/useAuthStore";
import { useFriendsStore }       from "@/store/useFriendsStore";
import { removeFriend }          from "@/lib/friendsService";
import { getChatId }             from "@/lib/chatService";
import { PresenceDot }           from "@/components/friends/PresenceDot";
import { ChatDrawer }            from "@/components/friends/ChatDrawer";
import { GlowButton }            from "@/components/ui/GlowButton";
import { getAvatar }             from "@/lib/avatars";
import { MessageSquare, UserMinus } from "lucide-react";
import { useRouter } from "next/navigation";

export function FriendsList() {
  const { user }                     = useAuthStore();
  const { users, requests, chats }   = useFriendsStore(); // ← from store
  const [chatWith,  setChatWith]     = useState(null);
  const [loading,   setLoading]      = useState({});
  const router = useRouter()

  const friends = [
    ...requests.sent
      .filter((r) => r.status === "accepted")
      .map((r)    => users.find((u) => u.uid === r.toUid)),
    ...requests.received
      .filter((r) => r.status === "accepted")
      .map((r)    => users.find((u) => u.uid === r.fromUid)),
  ].filter(Boolean);

  function getUnread(friendUid) {
    const chatId = getChatId(user.uid, friendUid);
    const chat   = chats.find((c) => c.id === chatId);
    return chat?.unread?.[user.uid] ?? 0;
  }

  async function handleRemove(friendUid) {
    setLoading((p) => ({ ...p, [friendUid]: true }));
    try { await removeFriend(user.uid, friendUid); }
    finally { setLoading((p) => ({ ...p, [friendUid]: false })); }
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        {friends.length === 0 ? (
          <div className="text-center py-10">
            <p className="font-mono text-xs text-muted-foreground tracking-widest">
              No friends yet. Find some in the Find Friends tab!
            </p>
          </div>
        ) : (
          friends.map((friend, i) => {
            const avatar = getAvatar(friend.avatarId);
            const unread = getUnread(friend.uid);
            return (
              <motion.div
                key={friend.uid}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between py-3 px-4 bg-background border border-border rounded-sm hover:border-border-game transition-colors duration-150"
              >
                <button 
                onClick={()=>router.push(`/player/${friend.displayUsername}`)}
                className="flex items-center gap-3 min-w-0 cursor-pointer">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-sm bg-card border border-border flex items-center justify-center text-xl shrink-0">
                      {avatar.icon}
                    </div>
                    <PresenceDot uid={friend.uid} className="absolute -bottom-0.5 -right-0.5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-mono text-xs text-foreground truncate">
                      {friend.displayUsername}
                    </span>
                    {friend.bio && (
                      <span className="font-mono text-[10px] text-muted-foreground truncate max-w-[160px]">
                        {friend.bio}
                      </span>
                    )}
                  </div>
                </button>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setChatWith(friend)}
                    className="relative flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-primary border border-border-game hover:border-primary px-3 py-1.5 rounded-sm transition-colors duration-150"
                  >
                    <MessageSquare size={13} />
                    Chat
                    {unread > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-primary-foreground font-mono text-[9px] flex items-center justify-center"
                      >
                        {unread > 9 ? "9+" : unread}
                      </motion.span>
                    )}
                  </button>
                  <button
                    onClick={() => handleRemove(friend.uid)}
                    disabled={loading[friend.uid]}
                    className="text-muted-foreground hover:text-destructive transition-colors duration-150"
                    title="Remove friend"
                  >
                    <UserMinus size={16} />
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
      <ChatDrawer friend={chatWith} onClose={() => setChatWith(null)} />
    </>
  );
}