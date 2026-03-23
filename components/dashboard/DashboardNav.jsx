"use client";
import { motion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";
import {
  Gamepad2, Users, BarChart2, Settings, LogOut,
} from "lucide-react";
import { getAvatar } from "@/lib/avatars";
import { Globe } from "lucide-react";

const links = [
  { label: "Play",     href: "/dashboard",          icon: Gamepad2  },
  { label: "Friends",  href: "/dashboard/friends",   icon: Users     },
  { label: "Rooms",  href: "/dashboard/rooms",   icon: Globe     },
  { label: "Stats",    href: "/dashboard/stats",     icon: BarChart2 },
  { label: "Settings", href: "/dashboard/settings",  icon: Settings  },
];

export function DashboardNav({ mobile = false }) {
  const pathname = usePathname();
  const router   = useRouter();
  const { profile, logout } = useAuthStore();
  const avatar = getAvatar(profile?.avatarId);

  async function handleLogout() {
    await logout();
    router.replace("/");
  }

  /* ── mobile bottom bar ── */
  if (mobile) {
    return (
      // mobile bottom bar — confirm z-index is z-50
      <nav
        className="flex items-center justify-around bg-card border-t border-border px-2"
        style={{
          paddingBottom: "env(safe-area-inset-bottom)",
          // ensure the bar itself has enough height above the home indicator
          minHeight: "calc(3.5rem + env(safe-area-inset-bottom))",
        }}
      >
        {links.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <button
              key={href}
              onClick={() => router.push(href)}
              className="flex flex-col items-center gap-1 flex-1"
            >
              <motion.div
                animate={{ color: active ? "var(--primary)" : "var(--muted-foreground)" }}
                transition={{ duration: 0.2 }}
              >
                <Icon size={20} />
              </motion.div>
              <span
                className={cn(
                  "font-mono text-[9px] tracking-widest uppercase",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
              {active && (
                <motion.span
                  layoutId="mobile-indicator"
                  className="w-1 h-1 rounded-full bg-primary"
                />
              )}
            </button>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 flex-1"
        >
          <LogOut size={20} className="text-muted-foreground" />
          <span className="font-mono text-[9px] tracking-widest uppercase text-muted-foreground">
            Logout
          </span>
        </button>
      </nav>
    );
  }

  /* ── desktop sidebar ── */
  return (
    <nav
      className="w-60 h-screen sticky top-0 flex flex-col border-r border-border bg-card px-4 py-6 gap-2"
      style={{
        paddingTop:  "max(1.5rem, env(safe-area-inset-top))",
        paddingLeft: "max(1rem, env(safe-area-inset-left))",
      }}
    >

      {/* logo */}
      <div className="px-3 mb-6">
        <span className="font-heading text-xl font-black text-primary tracking-widest">
          GRIDLOCK
        </span>
        <span className="block font-mono text-[9px] text-muted-foreground tracking-widest mt-0.5">
          ONLINE GAME ARENA
        </span>
      </div>

      {/* nav links */}
      <div className="flex flex-col gap-1 flex-1">
        {links.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <motion.button
              key={href}
              onClick={() => router.push(href)}
              whileHover={{ x: 3 }}
              transition={{ type: "spring", stiffness: 400, damping: 24 }}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-sm text-left transition-colors duration-150",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-background"
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-indicator"
                  className="absolute left-0 top-1 bottom-1 w-0.5 bg-primary rounded-full"
                />
              )}
              <Icon size={17} />
              <span className="font-mono text-xs tracking-widest uppercase">
                {label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* profile + logout */}
      <div className="border-t border-border pt-4 flex flex-col gap-2">
        {profile && (
          <button
            onClick={() => router.push(`/player/${profile.username}`)}
            className="flex items-center gap-3 px-3 py-2 hover:bg-background rounded-sm transition-colors duration-150 w-full"
          >
            <div className="w-8 h-8 rounded-sm bg-primary/10 border border-primary/30 flex items-center justify-center text-lg">
              {avatar.icon}
            </div>
            <div className="flex flex-col min-w-0 text-left">
              <span className="font-mono text-xs text-foreground truncate">
                {profile.displayUsername}
              </span>
              <span className="font-mono text-[10px] text-muted-foreground truncate">
                {profile.email}
              </span>
            </div>
          </button>
        )}
        <motion.button
          onClick={handleLogout}
          whileHover={{ x: 3 }}
          transition={{ type: "spring", stiffness: 400, damping: 24 }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-150"
        >
          <LogOut size={17} />
          <span className="font-mono text-xs tracking-widest uppercase">Logout</span>
        </motion.button>
      </div>
    </nav>
  );
}