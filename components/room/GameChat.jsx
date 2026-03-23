"use client";
import { motion, AnimatePresence } from "motion/react";
import { useState }               from "react";
import { MessageSquare, X, ChevronRight } from "lucide-react";
import { GameChatMessages }       from "@/components/room/GameChatMessages";
import { GameChatInput }          from "@/components/room/GameChatInput";
import { watchGameMessages }      from "@/lib/gameChatService";
import { useEffect, useRef }      from "react";

export function GameChat({ roomId, players }) {
  const [open,       setOpen]       = useState(false);
  const [unread,     setUnread]     = useState(0);
  const [msgCount,   setMsgCount]   = useState(0);
  const prevCount    = useRef(0);

  // track unread when drawer is closed
  useEffect(() => {
    if (!roomId) return;
    const unsub = watchGameMessages(roomId, (msgs) => {
      const count = msgs.length;
      if (!open && count > prevCount.current) {
        setUnread((u) => u + (count - prevCount.current));
      }
      prevCount.current = count;
      setMsgCount(count);
    });
    return () => unsub();
  }, [roomId, open]);

  // clear unread on open
  function handleOpen() {
    setOpen(true);
    setUnread(0);
  }

  return (
    <>
      {/* toggle button — fixed to right side of game area */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0  }}
            exit={{   opacity: 0, x: 20  }}
            onClick={handleOpen}
            className="fixed right-0 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-1 bg-card border border-border border-r-0 rounded-l-sm px-2 py-4 hover:bg-background transition-colors duration-150 group"
            style={{
              // keep button away from right edge notch on landscape
              marginRight: "env(safe-area-inset-right)",
            }}
          >
            <MessageSquare
              size={16}
              className="text-muted-foreground group-hover:text-primary transition-colors duration-150"
            />
            {unread > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="font-mono text-[9px] bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center"
              >
                {unread > 9 ? "9+" : unread}
              </motion.span>
            )}
            {/* rotated label */}
            <span
              className="font-mono text-[9px] text-muted-foreground tracking-widest uppercase"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              Chat
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* drawer */}
      <AnimatePresence>
        {open && (
          <>
            {/* mobile backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{   opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-30 bg-background/60 backdrop-blur-sm md:hidden"
            />

            {/* panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0       }}
              exit={{   x: "100%"   }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed right-0 top-0 bottom-0 z-40 w-72 bg-card border-l border-border flex flex-col shadow-2xl"
            >
              {/* header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
                <div className="flex items-center gap-2">
                  <MessageSquare size={14} className="text-primary" />
                  <span className="font-heading text-xs font-black tracking-widest text-foreground">
                    MATCH CHAT
                  </span>
                  {msgCount > 0 && (
                    <span className="font-mono text-[10px] text-muted-foreground">
                      ({msgCount})
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors duration-150"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* players in this chat */}
              {players && (
                <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="font-mono text-[10px] font-black"
                      style={{ color: "var(--player-x)" }}
                    >
                      {players.X?.displayName ?? "Player X"}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">vs</span>
                    <span
                      className="font-mono text-[10px] font-black"
                      style={{ color: "var(--player-o)" }}
                    >
                      {players.O?.displayName ?? "Player O"}
                    </span>
                  </div>
                  <span className="font-mono text-[9px] text-muted-foreground tracking-widest">
                    LIVE
                  </span>
                </div>
              )}

              {/* messages */}
              <GameChatMessages roomId={roomId} />

              {/* input */}
              <GameChatInput roomId={roomId} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}