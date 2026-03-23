"use client";
import { useEffect, useRef, useState }   from "react";
import { motion }                         from "motion/react";
import { watchMessages, markRead }        from "@/lib/chatService";
import { joinRoom }                       from "@/lib/roomService";
import { useAuthStore }                   from "@/store/useAuthStore";
import { db }                             from "@/lib/firebase";
import { doc, getDoc }                    from "firebase/firestore";

export function ChatMessages({ chatId, toUser }) {
  const { user, profile }   = useAuthStore();
  const [msgs,    setMsgs]  = useState([]);
  const [joining, setJoining] = useState(null); // roomId currently being joined
  const [joinErr, setJoinErr] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!chatId) return;
    const unsub = watchMessages(chatId, setMsgs);
    return () => unsub();
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  async function handleJoinRoom(roomId) {
    if (joining) return;
    setJoining(roomId);
    setJoinErr(null);
    try {
      // check if user is already in the room
      const snap = await getDoc(doc(db, "rooms", roomId));
      if (!snap.exists()) throw new Error("Room not found.");

      const room = snap.data();

      // if already a participant just navigate — don't re-join
      if (room.playerUids?.includes(user.uid)) {
        window.open(`/room/${roomId}`, "_blank");
        return;
      }

      // run the join transaction then navigate
      await joinRoom({ roomId, user, profile });
      window.open(`/room/${roomId}`, "_blank");
    } catch (err) {
      setJoinErr({ roomId, message: err.message ?? "Failed to join room." });
    } finally {
      setJoining(null);
    }
  }

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

        // ── room invite card ──────────────────────────
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
              {/* header */}
              <div className="flex items-center gap-2 px-3 py-2 border-b border-primary/20 bg-primary/5">
                <span className="text-sm">🎮</span>
                <span className="font-mono text-[10px] text-primary tracking-widest uppercase font-black">
                  Game Invite
                </span>
              </div>

              {/* details */}
              <div className="px-3 py-3 flex flex-col gap-2">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] text-muted-foreground tracking-widest uppercase">
                      Room ID
                    </span>
                    <span className="font-mono text-xs text-primary font-black">
                      #{msg.roomId?.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] text-muted-foreground tracking-widest uppercase">
                      Game
                    </span>
                    <span className="font-mono text-[10px] text-foreground">
                      {msg.roomMeta?.gameType}
                    </span>
                  </div>
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

                {/* receiver — join button with transaction */}
                {!isMe && msg.roomId && (
                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={() => handleJoinRoom(msg.roomId)}
                      disabled={joining === msg.roomId}
                      className="w-full font-mono text-xs text-primary-foreground bg-primary hover:bg-primary-dim disabled:opacity-50 rounded-sm py-2 transition-colors duration-150 font-black tracking-widest uppercase"
                    >
                      {joining === msg.roomId ? "Joining..." : "Join Room →"}
                    </button>
                    {/* per-invite error */}
                    {joinErr?.roomId === msg.roomId && (
                      <p className="font-mono text-[10px] text-destructive text-center">
                        {joinErr.message}
                      </p>
                    )}
                  </div>
                )}

                {/* sender — sent indicator */}
                {isMe && (
                  <span className="font-mono text-[9px] text-muted-foreground text-center tracking-widest">
                    Invite sent
                  </span>
                )}
              </div>
            </motion.div>
          </div>
        );

        // ── regular message bubble ────────────────────
        return (
          <div
            key={msg.id}
            className={`flex flex-col gap-0.5 ${isMe ? "items-end" : "items-start"}`}
          >
            <span className="font-mono text-[9px] text-muted-foreground px-1 tracking-widest">
              {isMe ? "YOU" : toUser?.displayUsername?.toUpperCase()}
            </span>
            <div
              className={`max-w-xs px-3 py-2 rounded-sm font-mono text-xs leading-relaxed break-words ${
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