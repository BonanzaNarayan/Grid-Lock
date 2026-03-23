"use client";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore }        from "@/store/useAuthStore";
import { watchFriendRequests, watchAllUsers } from "@/lib/friendsService";
import { watchChats, getChatId }             from "@/lib/chatService";
import { PresenceDot }         from "@/components/friends/PresenceDot";
import { getAvatar }           from "@/lib/avatars";
import { Users, MessageSquare } from "lucide-react";

export function FriendsList() {
  const { user }   = useAuthStore();
  const router     = useRouter();

  const [requests, setRequests] = useState({ sent: [], received: [] });
  const [users,    setUsers]    = useState([]);
  const [chats,    setChats]    = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!user) return;
    const u1 = watchFriendRequests(user.uid, (r) => {
      setRequests(r);
      setLoading(false);
    });
    const u2 = watchAllUsers(setUsers);
    const u3 = watchChats(user.uid, setChats);
    return () => { u1(); u2(); u3(); };
  }, [user]);

  // derive friends list from accepted requests in both directions
  const friends = [
    ...requests.sent
      .filter((r) => r.status === "accepted")
      .map((r)    => users.find((u) => u.uid === r.toUid)),
    ...requests.received
      .filter((r) => r.status === "accepted")
      .map((r)    => users.find((u) => u.uid === r.fromUid)),
  ].filter(Boolean);

  // total unread across all chats
  const totalUnread = chats.reduce(
    (sum, c) => sum + (c.unread?.[user?.uid] ?? 0), 0
  );

  // unread per friend
  function getUnread(friendUid) {
    const chatId = getChatId(user.uid, friendUid);
    const chat   = chats.find((c) => c.id === chatId);
    return chat?.unread?.[user.uid] ?? 0;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="relative bg-card border border-border rounded-sm overflow-hidden"
    >
      <span className="absolute top-0 left-6 right-6 h-px bg-primary opacity-20" />

      {/* header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <h3 className="font-heading text-sm font-black tracking-widest text-foreground">
            FRIENDS
          </h3>
          {friends.length > 0 && (
            <span className="font-mono text-[10px] text-muted-foreground border border-border-game px-1.5 py-0.5 rounded-sm">
              {friends.length}
            </span>
          )}
        </div>

        {/* unread badge + nav shortcut */}
        <div className="flex items-center gap-2">
          {totalUnread > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 font-mono text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-sm"
            >
              <MessageSquare size={10} />
              {totalUnread} unread
            </motion.span>
          )}
          <button
            onClick={() => router.push("/dashboard/friends")}
            className="font-mono text-[10px] text-muted-foreground hover:text-primary border border-border-game hover:border-primary px-2 py-0.5 rounded-sm transition-colors duration-150"
          >
            View All →
          </button>
        </div>
      </div>

      {/* body */}
      {loading ? (
        <div className="px-6 py-8 flex items-center justify-center">
          <p className="font-mono text-xs text-muted-foreground tracking-widest animate-pulse">
            LOADING...
          </p>
        </div>
      ) : friends.length === 0 ? (
        <div className="px-6 py-8 flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-sm bg-background border border-border flex items-center justify-center">
            <Users size={18} className="text-muted-foreground" />
          </div>
          <p className="font-mono text-xs text-muted-foreground tracking-widest text-center leading-relaxed">
            No friends yet.
            <br />
            <button
              onClick={() => router.push("/dashboard/friends")}
              className="text-primary hover:text-accent-game transition-colors duration-150"
            >
              Find players to add →
            </button>
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {/* show max 5 on dashboard */}
          {friends.slice(0, 5).map((friend, i) => {
            const avatar  = getAvatar(friend.avatarId);
            const unread  = getUnread(friend.uid);

            return (
              <motion.div
                key={friend.uid}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1,  x: 0  }}
                transition={{ duration: 0.25, delay: i * 0.05 }}
                className="flex items-center justify-between px-6 py-3 hover:bg-background transition-colors duration-150"
              >
                {/* avatar + name + presence */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <div className="w-8 h-8 rounded-sm bg-background border border-border flex items-center justify-center text-base">
                      {avatar.icon}
                    </div>
                    <PresenceDot
                      uid={friend.uid}
                      className="absolute -bottom-0.5 -right-0.5"
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-mono text-xs text-foreground truncate">
                      {friend.displayUsername}
                    </span>
                    {friend.gamerTag && (
                      <span className="font-mono text-[10px] text-muted-foreground truncate">
                        {friend.gamerTag}
                      </span>
                    )}
                  </div>
                </div>

                {/* chat button + unread */}
                <button
                  onClick={() => router.push("/dashboard/friends?tab=friends")}
                  className="relative flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground hover:text-primary border border-border-game hover:border-primary px-2.5 py-1.5 rounded-sm transition-colors duration-150 shrink-0"
                >
                  <MessageSquare size={11} />
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
              </motion.div>
            );
          })}

          {/* overflow hint */}
          {friends.length > 5 && (
            <button
              onClick={() => router.push("/dashboard/friends")}
              className="w-full px-6 py-3 font-mono text-[10px] text-muted-foreground hover:text-primary text-center transition-colors duration-150"
            >
              +{friends.length - 5} more friends →
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}