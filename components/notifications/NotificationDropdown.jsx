"use client";
import { motion, AnimatePresence } from "motion/react";
import { useRouter }               from "next/navigation";
import {
  markNotificationRead,
  markAllRead,
} from "@/lib/notificationService";
import { useAuthStore }            from "@/store/useAuthStore";
import { useNotificationStore }    from "@/store/useNotificationStore";
import { Check }                   from "lucide-react";

const TYPE_ICONS = {
  friend_request:  "👥",
  friend_accepted: "✅",
  new_message:     "💬",
  room_invite:     "🎮",
  room_joined:     "⚡",
  challenge:       "⚔️",
  level_up:        "🏆",
};

function timeAgo(ts) {
  if (!ts?.toMillis) return "";
  const diff  = Date.now() - ts.toMillis();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return "now";
  if (mins  < 60) return `${mins}m`;
  if (hours < 24) return `${hours}h`;
  return `${days}d`;
}

export function NotificationDropdown({ onClose }) {
  const { user }        = useAuthStore();
  const notifications   = useNotificationStore((s) => s.notifications);
  const router          = useRouter();

  async function handleClick(notif) {
    await markNotificationRead(user.uid, notif.id);
    onClose();
    if (notif.link)           router.push(notif.link);
    if (notif.meta?.roomId)   window.open(`/room/${notif.meta.roomId}`, "_blank");
  }

  async function handleMarkAll() {
    await markAllRead(user.uid, notifications);
  }

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1    }}
      exit={{   opacity: 0, y: 8, scale: 0.97  }}
      transition={{ duration: 0.2 }}
      className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-sm shadow-2xl overflow-hidden z-50"
    >
      {/* header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="font-heading text-xs font-black text-foreground tracking-widest">
            NOTIFICATIONS
          </span>
          {unread > 0 && (
            <span className="font-mono text-[9px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-sm">
              {unread}
            </span>
          )}
        </div>
        {unread > 0 && (
          <button
            onClick={handleMarkAll}
            className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground hover:text-primary transition-colors duration-150"
          >
            <Check size={11} />
            Mark all read
          </button>
        )}
      </div>

      {/* list */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="font-mono text-xs text-muted-foreground tracking-widest">
              No notifications yet.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-background transition-colors duration-150 ${
                  !n.read ? "bg-primary/5" : ""
                }`}
              >
                <span className="text-base shrink-0 mt-0.5">
                  {TYPE_ICONS[n.type] ?? "🔔"}
                </span>
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`font-heading text-xs font-black tracking-wide truncate ${
                      !n.read ? "text-foreground" : "text-muted-foreground"
                    }`}>
                      {n.title}
                    </span>
                    <span className="font-mono text-[9px] text-muted-foreground shrink-0">
                      {timeAgo(n.createdAt)}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {n.message}
                  </span>
                </div>
                {!n.read && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}