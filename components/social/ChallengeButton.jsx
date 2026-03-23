"use client";
import { useState, useEffect }     from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuthStore }            from "@/store/useAuthStore";
import { sendChallenge, watchSentChallenge } from "@/lib/challengeService";
import { GlowButton }              from "@/components/ui/GlowButton";

const GAMES = [
  { id: "tic-tac-toe",  label: "Tic-Tac-Toe", icon: "✕ ○" },
  { id: "connect-four", label: "Connect Four", icon: "◉ ◉" },
];

const MODES = [
  { id: "bo1", label: "1 Round"   },
  { id: "bo3", label: "Best of 3" },
  { id: "bo5", label: "Best of 5" },
];

export function ChallengeButton({ toProfile }) {
  const { user, profile }    = useAuthStore();
  const [open,        setOpen]        = useState(false);
  const [game,        setGame]        = useState("tic-tac-toe");
  const [mode,        setMode]        = useState("bo3");
  const [sending,     setSending]     = useState(false);
  const [sent,        setSent]        = useState(false);
  const [challengeId, setChallengeId] = useState(null);
  const [error,       setError]       = useState(null);
  const [status,      setStatus]      = useState(null); // "pending"|"accepted"|"declined"

  // watch for acceptance after sending
  useEffect(() => {
    if (!challengeId) return;
    const unsub = watchSentChallenge(challengeId, (c) => {
      setStatus(c.status);
      if (c.status === "accepted" && c.roomId) {
        // challenger navigates to the room
        window.open(`/room/${c.roomId}`, "_blank");
        setChallengeId(null);
        setOpen(false);
        setSent(false);
        setStatus(null);
      }
    });
    return () => unsub();
  }, [challengeId]);

  async function handleSend() {
    setSending(true); setError(null);
    try {
      const ref = await sendChallenge({
        fromUid:   user.uid,
        fromName:  profile.displayUsername,
        toUid:     toProfile.uid,
        toName:    toProfile.displayUsername,
        gameType:  game,
        mode,
        timerSecs: 30,
      });
      setChallengeId(ref.id); // ← now defined because sendChallenge returns the ref
      setSent(true);
    } catch {
      setError("Failed to send challenge. Try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="relative">
      <GlowButton
        variant="primary"
        className="text-xs py-1.5 px-4"
        onClick={() => setOpen((p) => !p)}
      >
        ⚔ Challenge
      </GlowButton>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1    }}
            exit={{   opacity: 0, y: 8, scale: 0.97  }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 z-50 bg-card border border-border rounded-sm p-4 flex flex-col gap-4 w-64 shadow-xl"
          >
            <span className="absolute top-0 left-4 right-4 h-px bg-primary opacity-30" />

            <p className="font-heading text-xs font-black text-foreground tracking-widest">
              CHALLENGE {toProfile.displayUsername.toUpperCase()}
            </p>

            {sent ? (
              <div className="flex flex-col gap-3">
                {status === "declined" ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-mono text-xs text-destructive text-center"
                  >
                    Challenge declined.
                  </motion.p>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <motion.span
                      className="w-2 h-2 rounded-full bg-primary"
                      animate={{ opacity: [1, 0.2, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    />
                    <p className="font-mono text-xs text-primary text-center tracking-widest">
                      ✦ Challenge sent!
                    </p>
                    <p className="font-mono text-[10px] text-muted-foreground text-center">
                      Waiting for {toProfile.displayUsername} to accept...
                    </p>
                  </motion.div>
                )}
                <GlowButton
                  variant="ghost"
                  className="w-full justify-center text-xs py-1.5"
                  onClick={() => {
                    setSent(false);
                    setChallengeId(null);
                    setStatus(null);
                  }}
                >
                  {status === "declined" ? "Try Again" : "Cancel"}
                </GlowButton>
              </div>
            ) : (
              <>
                {/* game type */}
                <div className="flex flex-col gap-1.5">
                  <span className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase">
                    Game
                  </span>
                  <div className="flex bg-background border border-border rounded-sm overflow-hidden">
                    {GAMES.map((g) => (
                      <button
                        key={g.id}
                        onClick={() => setGame(g.id)}
                        className={`flex items-center gap-1.5 font-mono text-[10px] tracking-widest flex-1 justify-center py-1.5 transition-colors duration-150
                          ${game === g.id
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground"}`}
                      >
                        <span>{g.icon}</span>
                        <span className="hidden sm:inline text-[9px]">{g.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* mode */}
                <div className="flex flex-col gap-1.5">
                  <span className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase">
                    Mode
                  </span>
                  <div className="flex bg-background border border-border rounded-sm overflow-hidden">
                    {MODES.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setMode(m.id)}
                        className={`font-mono text-[10px] tracking-widest flex-1 py-1.5 transition-colors duration-150
                          ${mode === m.id
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground"}`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <p className="font-mono text-[10px] text-destructive">{error}</p>
                )}

                <GlowButton
                  onClick={handleSend}
                  disabled={sending}
                  className="w-full justify-center text-xs py-2"
                >
                  {sending ? "Sending..." : "Send Challenge"}
                </GlowButton>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}