import { create }              from "zustand";
import { watchAllUsers, watchFriendRequests } from "@/lib/friendsService";
import { watchChats }          from "@/lib/chatService";

export const useFriendsStore = create((set, get) => ({
  users:    [],
  requests: { sent: [], received: [] },
  chats:    [],
  initialized: false,
  unsubs:   [],

  init(uid) {
    // prevent duplicate listeners
    if (get().initialized) return;
    set({ initialized: true });

    const unsubs = [];

    // single watchAllUsers listener shared across all components
    unsubs.push(
      watchAllUsers((users) => set({ users }))
    );

    unsubs.push(
      watchFriendRequests(uid, (requests) => set({ requests }))
    );

    unsubs.push(
      watchChats(uid, (chats) => set({ chats }))
    );

    set({ unsubs });
  },

  teardown() {
    get().unsubs.forEach((u) => u?.());
    set({ users: [], requests: { sent: [], received: [] }, chats: [], initialized: false, unsubs: [] });
  },
}));