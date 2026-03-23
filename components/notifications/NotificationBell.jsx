"use client";
import { useState } from "react";
import { Bell } from "lucide-react";
import { useNotificationStore } from "@/store/useNotificationStore";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "motion/react";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const notifications = useNotificationStore((s) => s.notifications);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="relative flex items-center justify-center w-9 h-9 rounded-sm border border-border hover:border-primary bg-card hover:bg-background transition-colors duration-150">
          <Bell size={16} className="text-muted-foreground" />
          <AnimatePresence>
            {unread > 0 && (
              <motion.span
                key="badge"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1.5 -right-1.5 min-w-4.5 h-4.5 rounded-full bg-primary text-primary-foreground font-mono text-[9px] flex items-center justify-center px-1"
              >
                {unread > 9 ? "9+" : unread}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </DialogTrigger>
      <DialogContent className="w-80 p-0 bg-card border-border rounded-sm shadow-2xl overflow-hidden [&>button]:hidden">
        <NotificationDropdown onClose={() => setOpen(false)} hideCloseButton />
      </DialogContent>
    </Dialog>
  );
}