import { db }               from "@/lib/firebase";
import {
  doc, updateDoc, serverTimestamp, runTransaction,
} from "firebase/firestore";
import { checkWinner as checkTTT, isDraw as isDrawTTT }
  from "@/lib/gameLogic/ticTacToe";
import { checkWinner as checkC4, isDraw as isDrawC4 }
  from "@/lib/gameLogic/connectFour";

import { createNotification, notifyRoomJoined } from "@/lib/notificationService";
import {
  notifyLevelUp,
} from "@/lib/notificationService";
import {
  getTotalXP, getLevel, getRank,
} from "@/lib/levelService";
import {
  checkGameAchievements,
  checkLevelAchievements,
  ACHIEVEMENT_MAP,
} from "@/lib/achievementService";
import { getStreakData } from "@/lib/statsService";

function getGameLogic(gameType, boardSize) {
  if (gameType === "connect-four") {
    return {
      checkWinner: (board) => checkC4(board, boardSize),
      isDraw:      (board) => isDrawC4(board, boardSize),
    };
  }
  return {
    checkWinner: (board) => checkTTT(board),
    isDraw:      (board) => isDrawTTT(board),
  };
}

export async function makeMove({
  roomId, index, board, currentTurn,
  mode, scores, round, gameType, boardSize,
}) {
  const newBoard = [...board];
  newBoard[index] = currentTurn;

  const { checkWinner, isDraw } = getGameLogic(gameType, boardSize);

  const result   = checkWinner(newBoard);
  const draw     = !result && isDraw(newBoard);
  const nextTurn = currentTurn === "X" ? "O" : "X";

  const newScores   = { ...scores };
  let   newRound    = round;
  let   newStatus   = "active";
  let   winner      = null;
  let   newBoard2   = newBoard;

  if (result) {
    newScores[result.winner] = (newScores[result.winner] ?? 0) + 1;
    winner = result.winner;
  } else if (draw) {
    winner = "draw";
  }

  const roundOver   = !!result || draw;
  const maxWins     = mode === "bo1" ? 1 : mode === "bo3" ? 2 : 3;
  const matchWinner =
    newScores.X >= maxWins ? "X"
    : newScores.O >= maxWins ? "O"
    : null;

  if (roundOver && matchWinner) {
    newStatus = "finished";
  } else if (roundOver) {
    newRound  = round + 1;
    // reset board to correct size for this game
    const { createBoard } = await import("@/lib/gameLogic/connectFour");
    newBoard2 = gameType === "connect-four"
      ? createBoard(boardSize)
      : Array(9).fill(null);
    winner = null;
  }

  const ref = doc(db, "rooms", roomId);
  await updateDoc(ref, {
    board:         newBoard2,
    currentTurn:   nextTurn,
    winner:        matchWinner ?? winner,
    scores:        newScores,
    round:         newRound,
    status:        newStatus,
    rematchVotes:  { X: false, O: false },
    turnStartedAt: serverTimestamp(),
    ...(newStatus === "finished" ? { finishedAt: serverTimestamp() } : {}),
  });
}

// keep all other exports unchanged — skipTurn, forfeit, voteRematch, applyRematch, updateStats
export async function skipTurn({ roomId, currentTurn }) {
  const ref = doc(db, "rooms", roomId);
  await updateDoc(ref, {
    currentTurn:   currentTurn === "X" ? "O" : "X",
    turnStartedAt: serverTimestamp(),
  });
}

export async function voteRematch({ roomId, mark }) {
  const ref = doc(db, "rooms", roomId);
  await updateDoc(ref, { [`rematchVotes.${mark}`]: true });
}

export async function applyRematch({ roomId, players, gameType, boardSize }) {
  const { createBoard } = await import("@/lib/gameLogic/connectFour");
  const ref   = doc(db, "rooms", roomId);
  await updateDoc(ref, {
    board:         gameType === "connect-four"
      ? createBoard(boardSize)
      : Array(9).fill(null),
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
    status:     "finished",
    winner,
    finishedAt: serverTimestamp(),
  });
}

export async function updateStats({
  db, winnerUid, loserUid, isDraw, gameType,
  winnerName, loserName,
}) {
  const { doc, setDoc, increment, getDoc } = await import("firebase/firestore");
  const { logActivity }  = await import("@/lib/activityService");
  const { XP_PER_WIN, XP_PER_DRAW, XP_PER_LOSS } = await import("@/lib/levelService");


    // inside updateStats, after writing XP, add:
    async function applyStats(uid, field, name, xp) {
      if (!uid) return [];

      const before      = await getDoc(doc(db, "users", uid));
      const beforeData  = before.data() ?? {};
      const beforeXP    = beforeData.xp ?? 0;
      const beforeLevel = getLevel(beforeXP);

      await setDoc(
        doc(db, "users", uid),
        {
          stats: {
            [gameType]: {
              wins:   field === "wins"   ? increment(1) : increment(0),
              losses: field === "losses" ? increment(1) : increment(0),
              draws:  field === "draws"  ? increment(1) : increment(0),
            },
          },
          xp: increment(xp),
        },
        { merge: true }
      );

      // get updated profile for achievement checks
      const after     = await getDoc(doc(db, "users", uid));
      const afterData = after.data() ?? {};
      const afterXP   = afterData.xp ?? 0;
      const afterLevel = getLevel(afterXP);

      // streak data
      const { current: streak } = await getStreakData(uid);

      // check game achievements
      const newAch = await checkGameAchievements(uid, {
        stats:  afterData.stats,
        streak,
        // room,
      });

      // check level achievements if leveled up
      let levelAch = [];
      if (afterLevel > beforeLevel) {
        const rank = getRank(afterLevel);
        await notifyLevelUp(uid, afterLevel, rank.title);
        await logActivity(uid, {
          type:    "level_up",
          message: `Reached Level ${afterLevel} — ${rank.title}!`,
        });
        levelAch = await checkLevelAchievements(uid, afterLevel);
      }

      // notify for each new achievement
      const allNew = [...newAch, ...levelAch];
      for (const id of allNew) {
        const ach = ACHIEVEMENT_MAP[id];
        if (!ach) continue;
        await createNotification(uid, {
          type:    "achievement",
          title:   `Achievement Unlocked: ${ach.title}`,
          message: ach.description,
          meta:    { achievementId: id },
        });
        await logActivity(uid, {
          type:    "achievement",
          message: `Unlocked "${ach.title}" — ${ach.description}`,
        });
      }

      return allNew;
    }

  if (isDraw) {
    await applyStats(winnerUid, "draws", winnerName, XP_PER_DRAW);
    await applyStats(loserUid,  "draws", loserName,  XP_PER_DRAW);
    if (winnerUid) await logActivity(winnerUid, { type: "draw",  message: `Drew a match of ${gameType}`, gameType });
    if (loserUid)  await logActivity(loserUid,  { type: "draw",  message: `Drew a match of ${gameType}`, gameType });
  } else {
    await applyStats(winnerUid, "wins",   winnerName, XP_PER_WIN);
    await applyStats(loserUid,  "losses", loserName,  XP_PER_LOSS);
    if (winnerUid) await logActivity(winnerUid, { type: "win",  message: `Won a match of ${gameType} vs ${loserName}`,  gameType });
    if (loserUid)  await logActivity(loserUid,  { type: "loss", message: `Lost a match of ${gameType} vs ${winnerName}`, gameType });
  }
}

export async function joinRoom({ roomId, user, profile }) {
  const roomRef = doc(db, "rooms", roomId);
  let creatorUid  = null;
  let gameType    = null;

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(roomRef);
    if (!snap.exists())            throw new Error("Room not found.");
    const room = snap.data();
    if (room.status !== "waiting") throw new Error("Room is no longer available.");
    if (room.players?.X?.uid === user.uid)
      throw new Error("You can't join your own room.");

    creatorUid = room.players?.X?.uid;
    gameType   = room.gameType;

    tx.update(roomRef, {
      "players.O":   { uid: user.uid, displayName: profile.displayUsername },
      playerUids:    [...(room.playerUids ?? []), user.uid],
      status:        "active",
      turnStartedAt: serverTimestamp(),
    });
  });

  // notify the room creator
  if (creatorUid) {
    await notifyRoomJoined(
      creatorUid,
      profile.displayUsername,
      roomId,
      gameType
    );
  }
}