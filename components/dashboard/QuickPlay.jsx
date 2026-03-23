"use client";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlowButton } from "@/components/ui/GlowButton";
import { GameInput }  from "@/components/ui/GameInput";
import { useAuthStore } from "@/store/useAuthStore";
import { db } from "@/lib/firebase";
import { joinRoom } from "@/lib/roomService";
import {
  collection, addDoc, serverTimestamp,
  runTransaction, doc,
} from "firebase/firestore";

const GAMES = [
  {
    id:          "tic-tac-toe",
    label:       "Tic-Tac-Toe",
    description: "Classic 3×3 grid. First to three wins.",
    available:   true,
    icon:        "✕ ○",
  },
  {
    id:          "connect-four",
    label:       "Connect Four",
    description: "Drop pieces, connect four to win.",
    available:   false,
    icon:        "◉ ◉",
  },
  {
    id:          "chess",
    label:       "Chess",
    description: "The classic strategy game.",
    available:   false,
    icon:        "♟ ♛",
  },
];

const MODES = [
  { id: "bo1", label: "1 Round"    },
  { id: "bo3", label: "Best of 3"  },
  { id: "bo5", label: "Best of 5"  },
];

const TIMERS = [
  { id: 15,  label: "15s" },
  { id: 30,  label: "30s" },
  { id: 60,  label: "60s" },
  { id: 90,  label: "90s" },
];

export function QuickPlay() {
  const router  = useRouter();
  const { user, profile } = useAuthStore();

  const [selectedGame, setSelectedGame] = useState(null);
  const [mode,         setMode]         = useState("bo3");
  const [isPrivate, setIsPrivate] = useState(false);
  const [timerSecs,    setTimerSecs]    = useState(30);
  const [tab,          setTab]          = useState("create");
  const [roomCode,     setRoomCode]     = useState("");
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);

  async function handleCreate() {
    if (!selectedGame?.available) return;
    setLoading(true); setError(null);
    try {
      const ref = await addDoc(collection(db, "rooms"), {
        gameType:      selectedGame.id,
        status:        "waiting",
        mode,
        timerSecs,
        isPrivate,
        createdAt:     serverTimestamp(),
        createdBy:     user.uid,
        players: {
          X: { uid: user.uid, displayName: profile.displayUsername },
          O: null,
        },
        playerUids:    [user.uid],
        currentTurn:   "X",
        winner:        null,
        board:         Array(9).fill(null),
        scores:        { X: 0, O: 0 },
        round:         1,
        rematchVotes:  { X: false, O: false },
        turnStartedAt: serverTimestamp(),
        finishedAt:    null,
      });
        window.open(`/room/${ref.id}`, "_blank");
    } catch {
      setError("Failed to create room. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
  if (!roomCode.trim())         return setError("Enter a room code.");
  if (!selectedGame?.available) return setError("Select a game first.");
  setLoading(true); setError(null);
  try {
    await joinRoom({ roomId: roomCode.trim(), user, profile });
    window.open(`/room/${roomCode.trim()}`, "_blank");
  } catch (err) {
    setError(err.message ?? "Failed to join room.");
  } finally {
    setLoading(false);
  }
}

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="relative bg-card border border-border rounded-sm p-6 flex flex-col gap-6"
    >
      <span className="absolute top-0 left-6 right-6 h-px bg-primary opacity-20" />

      <h3 className="font-heading text-sm font-black tracking-widest text-foreground">
        QUICK PLAY
      </h3>

      {/* step 1 — game selector */}
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          01 — Select Game
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {GAMES.map((game) => (
            <motion.button
              key={game.id}
              onClick={() => { if (game.available) { setSelectedGame(game); setError(null); } }}
              whileHover={game.available ? { scale: 1.02 } : {}}
              whileTap={game.available  ? { scale: 0.98 } : {}}
              className={`
                relative text-left border rounded-sm p-4 flex flex-col gap-2 transition-colors duration-150
                ${!game.available
                  ? "opacity-40 cursor-not-allowed border-border"
                  : "cursor-pointer"}
                ${selectedGame?.id === game.id
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-border-game bg-background"}
              `}
            >
              {!game.available && (
                <span className="absolute top-2 right-2 font-mono text-[9px] tracking-widest text-muted-foreground border border-border px-1.5 py-0.5 rounded-sm">
                  SOON
                </span>
              )}
              <span className="font-mono text-lg tracking-widest text-primary">
                {game.icon}
              </span>
              <span className="font-heading text-xs font-black text-foreground tracking-wide">
                {game.label}
              </span>
              <span className="font-sans text-[11px] text-muted-foreground leading-snug">
                {game.description}
              </span>
              {selectedGame?.id === game.id && (
                <motion.span
                  layoutId="game-selected"
                  className="absolute bottom-0 left-0 right-0 h-px bg-primary"
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* steps 2 + 3 — revealed after game selection */}
      <AnimatePresence>
        {selectedGame && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{   opacity: 0, height: 0      }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-6 overflow-hidden"
          >

            {/* step 2 — match settings (only for create) */}
            <AnimatePresence>
              {tab === "create" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{   opacity: 0, height: 0      }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col gap-3 overflow-hidden"
                >
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    02 — Match Settings
                  </span>
                  <div className="flex flex-wrap gap-4">

                    {/* rounds */}
                    <div className="flex flex-col gap-1.5">
                      <span className="font-mono text-[10px] text-muted-foreground tracking-widest">
                        Rounds
                      </span>
                      <div className="flex bg-background border border-border rounded-sm overflow-hidden">
                        {MODES.map((m) => (
                          <button
                            key={m.id}
                            onClick={() => setMode(m.id)}
                            className={`
                              font-mono text-xs tracking-widest px-4 py-2 transition-colors duration-150
                              ${mode === m.id
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:text-foreground"}
                            `}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* timer */}
                    <div className="flex flex-col gap-1.5">
                      <span className="font-mono text-[10px] text-muted-foreground tracking-widest">
                        Turn Timer
                      </span>
                      <div className="flex bg-background border border-border rounded-sm overflow-hidden">
                        {TIMERS.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setTimerSecs(t.id)}
                            className={`
                              font-mono text-xs tracking-widest px-4 py-2 transition-colors duration-150
                              ${timerSecs === t.id
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:text-foreground"}
                            `}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* private toggle */}
              <div className="flex flex-col w-fit gap-1.5">
                <span className="font-mono text-[10px] text-muted-foreground tracking-widest">
                  Visibility
                </span>
                <div className="flex bg-background border border-border rounded-sm overflow-hidden">
                  {[
                    { id: false, label: "Public"  },
                    { id: true,  label: "Private" },
                  ].map((opt) => (
                    <button
                      key={String(opt.id)}
                      onClick={() => setIsPrivate(opt.id)}
                      className={`
                        font-mono text-xs tracking-widest px-4 py-2 transition-colors duration-150
                        ${isPrivate === opt.id
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"}
                      `}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              {isPrivate && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1,  y: 0  }}
                  className="font-mono text-[10px] text-muted-foreground"
                >
                  ✦ Room won&apos;t appear in Open Rooms. Share the code directly.
                </motion.p>
              )}

            {/* step 3 — create or join */}
            <div className="flex flex-col gap-4">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {tab === "create" ? "03" : "02"} — Create or Join
              </span>

              {/* tab toggle */}
              <div className="flex bg-background border border-border rounded-sm overflow-hidden w-fit">
                {["create", "join"].map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTab(t); setError(null); setRoomCode(""); }}
                    className={`
                      font-mono text-xs tracking-widest uppercase px-6 py-2 transition-colors duration-150
                      ${tab === t
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"}
                    `}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: 6  }}
                  animate={{ opacity: 1, y: 0  }}
                  exit={{   opacity: 0, y: -6  }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-3"
                >
                  {tab === "create" ? (
                    <>
                      <p className="font-sans text-sm text-muted-foreground">
                        Create a new room and share the code with a friend.
                      </p>
                      <GlowButton
                        onClick={handleCreate}
                        disabled={loading}
                        className="w-fit"
                      >
                        {loading ? "Creating..." : "Create Room"}
                      </GlowButton>
                    </>
                  ) : (
                    <>
                      <GameInput
                        label="Room Code"
                        id="roomCode"
                        placeholder="Paste room ID here..."
                        value={roomCode}
                        onChange={(e) => { setRoomCode(e.target.value); setError(null); }}
                      />
                      <GlowButton
                        onClick={handleJoin}
                        disabled={loading || !roomCode.trim()}
                        className="w-fit"
                      >
                        {loading ? "Joining..." : "Join Room"}
                      </GlowButton>
                    </>
                  )}

                  {/* error */}
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1,  y: 0  }}
                      className="font-mono text-xs text-destructive"
                    >
                      {error}
                    </motion.p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}