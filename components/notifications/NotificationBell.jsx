"use client";
import { motion, AnimatePresence } from "motion/react";
import { useState, useRef, useEffect } from "react";
import { Bell }                    from "lucide-react";
import { useNotificationStore }    from "@/store/useNotificationStore";
import { NotificationDropdown }    from "@/components/notifications/NotificationDropdown";

export function NotificationBell() {
  const [open, setOpen]      = useState(false);
  const ref                  = useRef(null);
  const notifications        = useNotificationStore((s) => s.notifications);
  const unread               = notifications.filter((n) => !n.read).length;

  // close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="relative flex items-center justify-center w-9 h-9 border rounded-xl bg-card hover:bg-background transition-colors duration-150"
      >
        <Bell size={16} className="text-muted-foreground" />
        <AnimatePresence>
          {unread > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{   scale: 0 }}
              className="absolute -top-1.5 -right-1.5 min-w-4.5 h-4.5 rounded-full bg-primary text-primary-foreground font-mono text-[9px] flex items-center justify-center px-1"
            >
              {unread > 9 ? "9+" : unread}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <NotificationDropdown onClose={() => setOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}