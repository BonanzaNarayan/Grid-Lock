"use client";
import { AnimatePresence }      from "motion/react";
import { useNotificationStore } from "@/store/useNotificationStore";
import { ToastNotification }    from "@/components/notifications/ToastNotification";

export function ToastStack() {
  const toasts = useNotificationStore((s) => s.toasts);

  return (
    <div
      className="fixed z-200 flex flex-col gap-3"
      style={{
        top:   "max(1rem, env(safe-area-inset-top))",
        right: "max(1rem, env(safe-area-inset-right))",
      }}
    >
      <AnimatePresence mode="sync">
        {toasts.map((toast) => (
          <ToastNotification key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}