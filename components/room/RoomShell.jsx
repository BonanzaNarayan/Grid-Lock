"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter }      from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db }             from "@/lib/firebase";
import { useAuthStore }   from "@/store/useAuthStore";
import { makeMove, skipTurn, voteRematch, applyRematch, forfeit, updateStats } from "@/lib/roomService";
import { RoomHeader }     from "@/components/room/RoomHeader";
import { PlayerBar }      from "@/components/room/PlayerBar";
import { ResultOverlay }  from "@/components/room/ResultOverlay";
import { TicTacToe }      from "@/components/room/games/TicTacToe";
import { ScanlinesBg }    from "@/components/ui/ScanlinesBg";
import { motion }         from "motion/react";
import { GameChat } from "@/components/room/GameChat";

// game registry — add new games here
import { gameRegistry } from "@/components/room/games";

export function RoomShell({ roomId }) {
  const router  = useRouter();
  const { user, profile } = useAuthStore();

  const [room,    setRoom]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const statsUpdated = useRef(false);

  // derive my mark
  const myMark =
    room?.players?.X?.uid === user?.uid ? "X"
    : room?.players?.O?.uid === user?.uid ? "O"
    : null;

  // onSnapshot
  useEffect(() => {
    if (!roomId) return;
    const ref   = doc(db, "rooms", roomId);
    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) { setError("Room not found."); setLoading(false); return; }
      setRoom({ id: snap.id, ...snap.data() });
      setLoading(false);
    }, () => { setError("Failed to load room."); setLoading(false); });
    return () => unsub();
  }, [roomId]);

  // update stats once when match finishes
  useEffect(() => {
    if (!room || room.status !== "finished" || statsUpdated.current) return;
    statsUpdated.current = true;

    const { winner, players, mode, scores } = room;
    const maxWins    = mode === "bo1" ? 1 : mode === "bo3" ? 2 : 3;
    const matchWinner =
      scores?.X >= maxWins ? "X"
      : scores?.O >= maxWins ? "O"
      : "draw";

    const isDraw_    = matchWinner === "draw";
    const winnerUid  = isDraw_ ? null : players?.[matchWinner]?.uid;
    const loserMark  = matchWinner === "X" ? "O" : "X";
    const loserUid   = isDraw_ ? null : players?.[loserMark]?.uid;

    updateStats({ db, winnerUid, loserUid, isDraw: isDraw_, gameType: room.gameType });
  }, [room?.status]);

  // auto-apply rematch when both vote
  useEffect(() => {
    if (!room) return;
    const { rematchVotes } = room;
    if (rematchVotes?.X && rematchVotes?.O) {
      applyRematch({ roomId, players: room.players });
      statsUpdated.current = false;
    }
  }, [room?.rematchVotes]);

  async function handleMove(index) {
    if (!room || !myMark) return;
    await makeMove({
      roomId,
      index,
      board:       room.board,
      currentTurn: room.currentTurn,
      mode:        room.mode,
      scores:      room.scores,
      round:       room.round,
    });
  }

  async function handleTimerExpire() {
    if (!room || room.currentTurn !== myMark) return;
    await skipTurn({ roomId, currentTurn: room.currentTurn });
  }

  async function handleForfeit() {
    if (!room || !myMark) return;
    await forfeit({ roomId, mark: myMark });
  }

  async function handleRematch() {
    if (!room || !myMark) return;
    await voteRematch({ roomId, mark: myMark });
  }

  if (loading) return (
    <ScanlinesBg className="flex items-center justify-center">
      <p className="font-mono text-xs text-muted-foreground tracking-widest animate-pulse">
        CONNECTING...
      </p>
    </ScanlinesBg>
  );

  if (error) return (
    <ScanlinesBg className="flex items-center justify-center">
      <p className="font-mono text-xs text-destructive tracking-widest">{error}</p>
    </ScanlinesBg>
  );

  const GameComponent = gameRegistry[room.gameType];

  return (
    <ScanlinesBg>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-lg flex flex-col gap-4"
        >
          {/* header */}
          <RoomHeader
            roomId={roomId}
            status={room.status}
            onForfeit={handleForfeit}
          />

          {/* players + timer */}
          <PlayerBar
            room={room}
            myMark={myMark}
            onTimerExpire={handleTimerExpire}
          />

          {/* waiting state */}
          {room.status === "waiting" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card border border-border rounded-sm px-6 py-10 flex flex-col items-center gap-3"
            >
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-primary"
              />
              <p className="font-mono text-xs text-muted-foreground tracking-widest">
                WAITING FOR OPPONENT...
              </p>
              <p className="font-mono text-[10px] text-muted-foreground">
                Share room code: <span className="text-primary">#{roomId.slice(0, 8).toUpperCase()}</span>
              </p>
            </motion.div>
          )}

          {/* game board */}
          {room.status !== "waiting" && GameComponent && (
            <div className="relative bg-card border border-border rounded-sm p-6 flex flex-col items-center gap-4">
              <span className="absolute top-0 left-6 right-6 h-px bg-primary opacity-20" />

              {/* turn indicator */}
              {room.status === "active" && (
                <p className="font-mono text-[10px] tracking-widest text-muted-foreground">
                  {room.currentTurn === myMark
                    ? <span className="text-primary">YOUR TURN</span>
                    : `${room.players?.[room.currentTurn]?.displayName?.toUpperCase()}'S TURN`
                  }
                </p>
              )}

              <GameComponent
                board={room.board}
                currentTurn={room.currentTurn}
                myMark={myMark}
                status={room.status}
                onMove={handleMove}
              />

              {/* result overlay */}
              <ResultOverlay
                room={room}
                myMark={myMark}
                onRematch={handleRematch}
                rematchVoted={room.rematchVotes?.[myMark]}
              />
            </div>
          )}
        </motion.div>
      </div>
      {/* chat — only show when both players are in */}
        {room.status !== "waiting" && (
          <GameChat roomId={roomId} players={room.players} />
      )}
    </ScanlinesBg>
  );
}