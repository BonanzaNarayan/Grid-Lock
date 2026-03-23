"use client";
import { motion }               from "motion/react";
import { useRouter }            from "next/navigation";
import { useNotificationStore } from "@/store/useNotificationStore";
import { X }                    from "lucide-react";

const TYPE_STYLES = {
  friend_request: { icon: "👥", accent: "border-accent-game/50  bg-accent-game/5"  },
  friend_accepted:{ icon: "✅", accent: "border-primary/50      bg-primary/5"      },
  new_message:    { icon: "💬", accent: "border-primary/50      bg-primary/5"      },
  room_invite:    { icon: "🎮", accent: "border-primary/50      bg-primary/5"      },
  room_joined:    { icon: "⚡", accent: "border-accent-game/50  bg-accent-game/5"  },
  challenge:      { icon: "⚔️", accent: "border-primary/50      bg-primary/5"      },
  level_up:       { icon: "🏆", accent: "border-yellow-400/50   bg-yellow-400/5"   },
};

export function ToastNotification({ toast }) {
  const router      = useRouter();
  const removeToast = useNotificationStore((s) => s.removeToast);
  const style       = TYPE_STYLES[toast.type] ?? TYPE_STYLES.new_message;

  function handleClick() {
    removeToast(toast.id);
    if (toast.link) router.push(toast.link);
    if (toast.meta?.roomId) window.open(`/room/${toast.meta.roomId}`, "_blank");
    toast.onAction?.();
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80,  scale: 0.95 }}
      animate={{ opacity: 1, x: 0,   scale: 1    }}
      exit={{   opacity: 0, x: 80,   scale: 0.95 }}
      transition={{ type: "spring", stiffness: 340, damping: 30 }}
      className={`relative flex items-start gap-3 bg-card border rounded-sm p-4 shadow-2xl cursor-pointer w-80 overflow-hidden ${style.accent}`}
      onClick={handleClick}
    >
      {/* progress bar */}
      <motion.span
        className="absolute bottom-0 left-0 h-0.5 bg-primary"
        initial={{ width: "100%" }}
        animate={{ width: "0%"   }}
        transition={{ duration: (toast.duration ?? 5000) / 1000, ease: "linear" }}
      />

      {/* icon */}
      <span className="text-xl shrink-0 mt-0.5">{style.icon}</span>

      {/* content */}
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className="font-heading text-xs font-black text-foreground tracking-wide">
          {toast.title}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground leading-relaxed line-clamp-2">
          {toast.message}
        </span>
        {(toast.link || toast.meta?.roomId) && (
          <span className="font-mono text-[10px] text-primary mt-1">
            Tap to view →
          </span>
        )}
      </div>

      {/* dismiss */}
      <button
        onClick={(e) => { e.stopPropagation(); removeToast(toast.id); }}
        className="text-muted-foreground hover:text-foreground transition-colors duration-150 shrink-0"
      >
        <X size={13} />
      </button>
    </motion.div>
  );
}