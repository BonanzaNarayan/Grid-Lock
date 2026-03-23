"use client";
import { useEffect, useState }     from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter }               from "next/navigation";
import { useAuthStore }            from "@/store/useAuthStore";
import { watchIncomingChallenges, acceptChallenge, declineChallenge } from "@/lib/challengeService";
import { joinRoom }                from "@/lib/roomService";
import { db }                      from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { GlowButton }              from "@/components/ui/GlowButton";
import { X }                       from "lucide-react";

export function ChallengeNotifications() {
  const { user, profile }        = useAuthStore();
  const router                   = useRouter();
  const [challenges, setChallenges] = useState([]);
  const [accepting,  setAccepting]  = useState(null);

  useEffect(() => {
    if (!user) return;
    const unsub = watchIncomingChallenges(user.uid, setChallenges);
    return () => unsub();
  }, [user]);

  async function handleAccept(challenge) {
    setAccepting(challenge.id);
    try {
      // 1. create the room
      const ref = await addDoc(collection(db, "rooms"), {
        gameType:      challenge.gameType,
        status:        "waiting",
        mode:          challenge.mode,
        timerSecs:     challenge.timerSecs ?? 30,
        isPrivate:     true,   // challenge rooms are always private
        boardSize:     challenge.boardSize ?? null,
        createdAt:     serverTimestamp(),
        createdBy:     challenge.fromUid,
        players: {
          X: { uid: challenge.fromUid, displayName: challenge.fromName },
          O: null,
        },
        playerUids:    [challenge.fromUid],
        currentTurn:   "X",
        winner:        null,
        board:         challenge.gameType === "connect-four"
          ? Array(challenge.boardSize === "mini" ? 30 : 42).fill(null)
          : Array(9).fill(null),
        scores:        { X: 0, O: 0 },
        round:         1,
        rematchVotes:  { X: false, O: false },
        turnStartedAt: serverTimestamp(),
        finishedAt:    null,
        challengeId:   challenge.id,
      });

      // 2. join the room as O
      await joinRoom({ roomId: ref.id, user, profile });

      // 3. mark challenge accepted + store roomId
      await acceptChallenge(challenge.id, ref.id);

      // 4. open room in new tab
      window.open(`/room/${ref.id}`, "_blank");

    } catch (err) {
      console.error("Failed to accept challenge:", err);
    } finally {
      setAccepting(null);
    }
  }

  async function handleDecline(challenge) {
    await declineChallenge(challenge.id);
  }

  if (!challenges.length) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 max-w-sm w-full">
      <AnimatePresence>
        {challenges.map((c) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, x: 60,  scale: 0.95 }}
            animate={{ opacity: 1, x: 0,   scale: 1    }}
            exit={{   opacity: 0, x: 60,   scale: 0.95 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="relative bg-card border border-primary/40 rounded-sm overflow-hidden shadow-2xl"
          >
            {/* top accent */}
            <span className="absolute top-0 left-0 right-0 h-px bg-primary opacity-60" />

            {/* dismiss */}
            <button
              onClick={() => handleDecline(c)}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors duration-150"
            >
              <X size={14} />
            </button>

            <div className="p-4 flex flex-col gap-3">
              {/* header */}
              <div className="flex flex-col gap-0.5 pr-6">
                <span className="font-mono text-[10px] text-primary tracking-widest uppercase">
                  ⚔ Challenge Received
                </span>
                <p className="font-heading text-sm font-black text-foreground">
                  {c.fromName} challenged you!
                </p>
              </div>

              {/* game details */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[10px] text-muted-foreground border border-border-game px-2 py-0.5 rounded-sm">
                  {c.gameType}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground border border-border-game px-2 py-0.5 rounded-sm">
                  {c.mode === "bo1" ? "1 Round" : c.mode === "bo3" ? "Best of 3" : "Best of 5"}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground border border-border-game px-2 py-0.5 rounded-sm">
                  {c.timerSecs ?? 30}s timer
                </span>
              </div>

              {/* actions */}
              <div className="flex gap-2">
                <GlowButton
                  className="flex-1 justify-center text-xs py-2"
                  disabled={accepting === c.id}
                  onClick={() => handleAccept(c)}
                >
                  {accepting === c.id ? "Joining..." : "Accept"}
                </GlowButton>
                <GlowButton
                  variant="danger"
                  className="flex-1 justify-center text-xs py-2"
                  disabled={accepting === c.id}
                  onClick={() => handleDecline(c)}
                >
                  Decline
                </GlowButton>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}