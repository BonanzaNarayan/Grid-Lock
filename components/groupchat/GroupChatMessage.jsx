"use client";
import { motion }          from "motion/react";
import { useState }        from "react";
import { useAuthStore }    from "@/store/useAuthStore";
import { deleteGroupMessage } from "@/lib/groupChatService";
import { getAvatar }       from "@/lib/avatars";
import { ReactionBar }     from "@/components/groupchat/GroupChatReactions";
import { Reply, Trash2 }   from "lucide-react";
import { joinRoom }     from "@/lib/roomService";
import { db }           from "@/lib/firebase";
import { doc, getDoc }  from "firebase/firestore";

function timeStr(ts) {
  if (!ts?.toMillis) return "";
  return new Date(ts.toMillis()).toLocaleTimeString([], {
    hour: "2-digit", minute: "2-digit",
  });
}

function JoinRoomButton({ roomId }) {
  const { user, profile } = useAuthStore();
  const [joining, setJoining] = useState(false);
  const [error,   setError]   = useState(null);

  async function handleJoin() {
    if (joining) return;
    setJoining(true);
    setError(null);
    try {
      // check if already a participant
      const snap = await getDoc(doc(db, "rooms", roomId));
      if (!snap.exists()) throw new Error("Room not found.");

      const room = snap.data();

      if (room.playerUids?.includes(user.uid)) {
        // already in — just open it
        window.open(`/room/${roomId}`, "_blank");
        return;
      }

      if (room.status !== "waiting") {
        throw new Error("Room is no longer available.");
      }

      // run join transaction then navigate
      await joinRoom({ roomId, user, profile });
      window.open(`/room/${roomId}`, "_blank");
    } catch (err) {
      setError(err.message ?? "Failed to join room.");
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5 mt-1">
      <button
        onClick={handleJoin}
        disabled={joining}
        className="w-full font-mono text-xs text-primary-foreground bg-primary hover:bg-primary-dim disabled:opacity-50 rounded-sm py-1.5 transition-colors duration-150 font-black tracking-widest uppercase"
      >
        {joining ? "Joining..." : "Join Room →"}
      </button>
      {error && (
        <p className="font-mono text-[10px] text-destructive text-center">
          {error}
        </p>
      )}
    </div>
  );
}

export function GroupChatMessage({ msg, chatId, onReply, prevSenderId }) {
  const { user }      = useAuthStore();
  const [hovered, setHovered] = useState(false);
  const isOwn         = msg.senderUid === user?.uid;
  const showAvatar    = msg.senderUid !== prevSenderId;
  const avatar        = getAvatar(msg.senderAvatar);

  if (msg.deleted) return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} px-4 py-0.5`}>
      <span className="font-mono text-[10px] text-muted-foreground italic border border-border px-3 py-1 rounded-sm">
        Message deleted
      </span>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col px-4 py-0.5 group ${isOwn ? "items-end" : "items-start"}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* sender name + avatar — only show when sender changes */}
      {showAvatar && (
        <div className={`flex items-center gap-2 mb-1 ${isOwn ? "flex-row-reverse" : ""}`}>
          <div className="w-6 h-6 rounded-sm bg-card border border-border flex items-center justify-center text-sm shrink-0">
            {avatar.icon}
          </div>
          <span className="font-mono text-[10px] text-muted-foreground">
            {isOwn ? "You" : msg.senderName}
          </span>
          <span className="font-mono text-[9px] text-muted-foreground/50">
            {timeStr(msg.createdAt)}
          </span>
        </div>
      )}

      <div className={`flex items-end gap-2 max-w-[85%] ${isOwn ? "flex-row-reverse" : ""}`}>
        {/* action buttons — show on hover */}
        <motion.div
          animate={{ opacity: hovered ? 1 : 0 }}
          className={`flex items-center gap-1 mb-1 ${isOwn ? "flex-row-reverse" : ""}`}
        >
          <button
            onClick={() => onReply(msg)}
            className="w-6 h-6 flex items-center justify-center rounded-sm hover:bg-card text-muted-foreground hover:text-primary transition-colors duration-150"
            title="Reply"
          >
            <Reply size={12} />
          </button>
          {isOwn && (
            <button
              onClick={() => deleteGroupMessage(chatId, msg.id)}
              className="w-6 h-6 flex items-center justify-center rounded-sm hover:bg-card text-muted-foreground hover:text-destructive transition-colors duration-150"
              title="Delete"
            >
              <Trash2 size={12} />
            </button>
          )}
        </motion.div>

        {/* bubble */}
        <div className="flex flex-col gap-1">
          {/* reply preview */}
          {msg.replyTo && (
            <div className={`flex items-start gap-1.5 px-2 py-1.5 rounded-sm border-l-2 border-primary bg-primary/5 mb-0.5`}>
              <div className="flex flex-col min-w-0">
                <span className="font-mono text-[9px] text-primary">
                  {msg.replyTo.senderName}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground truncate max-w-[180px]">
                  {msg.replyTo.text ?? "🎮 Game invite"}
                </span>
              </div>
            </div>
          )}

          {/* room invite */}
          {msg.type === "room_invite" ? (
            <div className="bg-primary/10 border border-primary/30 rounded-sm overflow-hidden min-w-[200px]">
              <div className="flex items-center gap-2 px-3 py-2 border-b border-primary/20 bg-primary/5">
                <span className="text-sm">🎮</span>
                <span className="font-mono text-[10px] text-primary tracking-widest uppercase font-black">
                  Game Invite
                </span>
              </div>
              <div className="px-3 py-2 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">Room</span>
                  <span className="font-mono text-xs text-primary font-black">
                    #{msg.roomId?.slice(0, 6).toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">Game</span>
                  <span className="font-mono text-[10px] text-foreground">{msg.roomMeta?.gameType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">Mode</span>
                  <span className="font-mono text-[10px] text-foreground">
                    {msg.roomMeta?.mode === "bo1" ? "1 Round"
                      : msg.roomMeta?.mode === "bo3" ? "Best of 3"
                      : "Best of 5"}
                  </span>
                </div>

                {/* join button — only for non-senders */}
                {!isOwn && msg.roomId && (
                  <JoinRoomButton roomId={msg.roomId} />
                )}

                {isOwn && (
                  <span className="font-mono text-[9px] text-muted-foreground text-center tracking-widest mt-1">
                    You shared this invite
                  </span>
                )}
              </div>
            </div>
          ) : (
            /* text / quick bubble */
            <div
              className={`px-3 py-2 rounded-sm font-mono text-xs leading-relaxed break-words max-w-xs
                ${isOwn
                  ? "bg-primary text-primary-foreground"
                  : msg.type === "quick"
                  ? "bg-card border border-primary/30 text-primary"
                  : "bg-card border border-border text-foreground"
                }`}
            >
              {msg.text}
            </div>
          )}

          {/* reactions */}
          <ReactionBar
            chatId={chatId}
            msgId={msg.id}
            reactions={msg.reactions}
            isOwn={isOwn}
          />
        </div>
      </div>
    </motion.div>
  );
}