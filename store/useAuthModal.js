import { create } from "zustand";

export const useAuthModal = create((set) => ({
  isOpen: false,
  view: "login", // "login" | "signup"
  open: (view = "login") => set({ isOpen: true, view }),
  close: () => set({ isOpen: false }),
  setView: (view) => set({ view }),
}));