import { db } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp, increment, runTransaction } from "firebase/firestore";
import { checkWinner, isDraw } from "@/lib/gameLogic/ticTacToe";

export async function makeMove({ roomId, index, board, currentTurn, mode, scores, round }) {
  const newBoard = [...board];
  newBoard[index] = currentTurn;

  const result   = checkWinner(newBoard);
  const draw     = !result && isDraw(newBoard);
  const nextTurn = currentTurn === "X" ? "O" : "X";

  // update scores if round over
  const newScores  = { ...scores };
  let   newRound   = round;
  let   newStatus  = "active";
  let   winner     = null;
  let   newBoard2  = newBoard;

  if (result) {
    newScores[result.winner] = (newScores[result.winner] ?? 0) + 1;
    winner = result.winner;
  } else if (draw) {
    winner = "draw";
  }

  const roundOver  = !!result || draw;
  const maxWins    = mode === "bo1" ? 1 : mode === "bo3" ? 2 : 3;
  const matchWinner =
    newScores.X >= maxWins ? "X"
    : newScores.O >= maxWins ? "O"
    : null;

  if (roundOver && matchWinner) {
    newStatus = "finished";
  } else if (roundOver) {
    // next round — reset board
    newRound  = round + 1;
    newBoard2 = Array(9).fill(null);
    winner    = null;
  }

  const ref = doc(db, "rooms", roomId);
  await updateDoc(ref, {
    board:         newBoard2,
    currentTurn:   roundOver && !matchWinner ? nextTurn : nextTurn,
    winner:        matchWinner ?? winner,
    scores:        newScores,
    round:         newRound,
    status:        newStatus,
    rematchVotes:  { X: false, O: false },
    turnStartedAt: serverTimestamp(),
    ...(newStatus === "finished" ? { finishedAt: serverTimestamp() } : {}),
  });
}

export async function skipTurn({ roomId, currentTurn }) {
  const ref = doc(db, "rooms", roomId);
  await updateDoc(ref, {
    currentTurn:   currentTurn === "X" ? "O" : "X",
    turnStartedAt: serverTimestamp(),
  });
}

export async function voteRematch({ roomId, mark }) {
  const ref = doc(db, "rooms", roomId);
  await updateDoc(ref, {
    [`rematchVotes.${mark}`]: true,
  });
}

export async function applyRematch({ roomId, players }) {
  const ref = doc(db, "rooms", roomId);
  await updateDoc(ref, {
    board:         Array(9).fill(null),
    status:        "active",
    winner:        null,
    currentTurn:   "X",
    round:         1,
    scores:        { X: 0, O: 0 },
    rematchVotes:  { X: false, O: false },
    turnStartedAt: serverTimestamp(),
    finishedAt:    null,
  });
}

export async function forfeit({ roomId, mark }) {
  const winner = mark === "X" ? "O" : "X";
  const ref    = doc(db, "rooms", roomId);
  await updateDoc(ref, {
    status:      "finished",
    winner,
    finishedAt:  serverTimestamp(),
  });
}

export async function updateStats({ db, winnerUid, loserUid, isDraw, gameType }) {
  const { doc, updateDoc, increment } = await import("firebase/firestore");
  if (isDraw) {
    if (winnerUid) await updateDoc(doc(db, "users", winnerUid), { [`stats.${gameType}.draws`]: increment(1) });
    if (loserUid)  await updateDoc(doc(db, "users", loserUid),  { [`stats.${gameType}.draws`]: increment(1) });
  } else {
    if (winnerUid) await updateDoc(doc(db, "users", winnerUid), { [`stats.${gameType}.wins`]:   increment(1) });
    if (loserUid)  await updateDoc(doc(db, "users", loserUid),  { [`stats.${gameType}.losses`]: increment(1) });
  }
}

export async function joinRoom({ roomId, user, profile }) {
  const roomRef = doc(db, "rooms", roomId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(roomRef);
    if (!snap.exists())
      throw new Error("Room not found.");
    const room = snap.data();
    if (room.status !== "waiting")
      throw new Error("Room is no longer available.");
    if (room.players?.X?.uid === user.uid)
      throw new Error("You can't join your own room.");
    tx.update(roomRef, {
      "players.O":   { uid: user.uid, displayName: profile.displayUsername },
      playerUids:    [...(room.playerUids ?? []), user.uid],
      status:        "active",
      turnStartedAt: serverTimestamp(),
    });
  });
}