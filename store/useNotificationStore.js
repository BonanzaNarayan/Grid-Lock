import { create } from "zustand";

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  toasts:        [],
  openChats:     new Set(), // track which chat drawers are open

  setNotifications: (notifications) => set({ notifications }),

  // add a toast — auto removed after duration
  addToast(toast) {
    const id = `${Date.now()}-${Math.random()}`;
    const entry = { ...toast, id };
    set((s) => ({ toasts: [...s.toasts, entry] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, toast.duration ?? 5000);
    return id;
  },

  removeToast(id) {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },

  // track open chat drawers so we don't notify for open conversations
  setOpenChat(uid, isOpen) {
    set((s) => {
      const next = new Set(s.openChats);
      if (isOpen) next.add(uid);
      else        next.delete(uid);
      return { openChats: next };
    });
  },

  isChatOpen(uid) {
    return get().openChats.has(uid);
  },

  unreadCount() {
    return get().notifications.filter((n) => !n.read).length;
  },
}));