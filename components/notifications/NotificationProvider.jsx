"use client";
import { useEffect, useRef }    from "react";
import { useAuthStore }         from "@/store/useAuthStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { watchNotifications }   from "@/lib/notificationService";
import { watchFriendRequests }  from "@/lib/friendsService";
import { watchChats }           from "@/lib/chatService";
import { watchIncomingChallenges } from "@/lib/challengeService";
import { db }                   from "@/lib/firebase";
import {
  collection, query, where, onSnapshot,
} from "firebase/firestore";

export function NotificationProvider() {
  const { user, profile }  = useAuthStore();
  const store              = useNotificationStore();

  // track previous state for change detection
  const prevRequests = useRef({ sent: [], received: [] });
  const prevChats    = useRef([]);
  const prevChallenges = useRef([]);

  useEffect(() => {
    if (!user) return;
    const unsubs = [];

    // ── 1. watch notification history ─────────────────────────
    unsubs.push(
      watchNotifications(user.uid, (notifs) => {
        store.setNotifications(notifs);
      })
    );

    // ── 2. friend requests ────────────────────────────────────
    unsubs.push(
      watchFriendRequests(user.uid, (requests) => {
        const prev = prevRequests.current;

        // new incoming pending request
        const newPending = requests.received.filter(
          (r) => r.status === "pending" &&
            !prev.received.find((p) => p.id === r.id)
        );
        newPending.forEach((r) => {
          store.addToast({
            type:    "friend_request",
            title:   "Friend Request",
            message: `${r.fromName ?? "Someone"} sent you a friend request.`,
            link:    "/dashboard/friends?tab=requests",
            duration: 6000,
          });
        });

        // sent request accepted
        const newAccepted = requests.sent.filter(
          (r) => r.status === "accepted" &&
            prev.sent.find((p) => p.id === r.id && p.status === "pending")
        );
        newAccepted.forEach((r) => {
          store.addToast({
            type:    "friend_accepted",
            title:   "Friend Request Accepted",
            message: `Your friend request was accepted!`,
            link:    "/dashboard/friends?tab=friends",
            duration: 5000,
          });
        });

        prevRequests.current = requests;
      })
    );

    // ── 3. new messages ───────────────────────────────────────
    unsubs.push(
      watchChats(user.uid, (chats) => {
        const prev = prevChats.current;

        chats.forEach((chat) => {
          const prevChat   = prev.find((c) => c.id === chat.id);
          const unread     = chat.unread?.[user.uid] ?? 0;
          const prevUnread = prevChat?.unread?.[user.uid] ?? 0;
          const otherUid   = chat.participants?.find((p) => p !== user.uid);

          // new unread message and chat is not open
          if (unread > prevUnread && otherUid && !store.isChatOpen(otherUid)) {
            store.addToast({
              type:    "new_message",
              title:   "New Message",
              message: chat.lastMessage ?? "You have a new message.",
              link:    "/dashboard/friends?tab=friends",
              meta:    { fromUid: otherUid },
              duration: 5000,
            });
          }
        });

        prevChats.current = chats;
      })
    );

    // ── 4. incoming challenges ────────────────────────────────
    unsubs.push(
      watchIncomingChallenges(user.uid, (challenges) => {
        const prev = prevChallenges.current;
        const newOnes = challenges.filter(
          (c) => !prev.find((p) => p.id === c.id)
        );
        // challenges are already handled by ChallengeNotifications
        // just update prev ref here — don't double-toast
        prevChallenges.current = challenges;
      })
    );

    // ── 5. someone joined your room ───────────────────────────
    const roomsQuery = query(
      collection(db, "rooms"),
      where("createdBy", "==", user.uid),
      where("status",    "==", "active")
    );
    const prevRoomStatuses = new Map();

    unsubs.push(
      onSnapshot(roomsQuery, (snap) => {
        snap.docs.forEach((d) => {
          const room = d.data();
          const prev = prevRoomStatuses.get(d.id);

          // room just became active (someone joined)
          if (!prev || prev === "waiting") {
            const joinerName = room.players?.O?.displayName;
            if (joinerName) {
              store.addToast({
                type:    "room_joined",
                title:   "Opponent Joined!",
                message: `${joinerName} joined your room. Game on!`,
                meta:    { roomId: d.id },
                duration: 6000,
              });
            }
          }
          prevRoomStatuses.set(d.id, room.status);
        });
      })
    );

    // ── 6. level up — watch XP changes ────────────────────────
    const { getLevel, getRank } = require("@/lib/levelService");
    let prevLevel = getLevel(profile?.xp ?? 0);

    const profileUnsub = watchNotifications(user.uid, (notifs) => {
      // level up notifications are written by updateStats
      // and will appear in the notification history automatically
      // we just need to toast the most recent level_up

      const recentAchievement = notifs.find(
        (n) => n.type === "achievement" &&
          !n.read &&
          (Date.now() - (n.createdAt?.toMillis?.() ?? 0)) < 10000
      );
      if (recentAchievement) {
        store.addToast({
          type:     "achievement",
          title:    recentAchievement.title,
          message:  recentAchievement.message,
          duration: 7000,
        });
      }
      const recentLevelUp = notifs.find(
        (n) => n.type === "level_up" && !n.read &&
          (Date.now() - (n.createdAt?.toMillis?.() ?? 0)) < 10000
      );
      if (recentLevelUp) {
        store.addToast({
          type:    "level_up",
          title:   "Level Up! 🏆",
          message: recentLevelUp.message,
          duration: 7000,
        });
      }
    });
    unsubs.push(profileUnsub);

    return () => unsubs.forEach((u) => u?.());
  }, [user?.uid]);

  return null; // renders nothing — just runs listeners
}