"use client";
import { motion, AnimatePresence } from "motion/react";
import { useState }                from "react";
import { usePathname, useRouter }  from "next/navigation";
import { useAuthStore }            from "@/store/useAuthStore";
import { cn }                      from "@/lib/utils";
import {
  Gamepad2, Users, BarChart2, Settings,
  LogOut, Globe, MessageSquare, MoreHorizontal, X,
} from "lucide-react";
import { getAvatar }               from "@/lib/avatars";
import { NotificationBell }        from "@/components/notifications/NotificationBell";

// primary nav — always visible in bottom bar
const PRIMARY_LINKS = [
  { label: "Play",    href: "/dashboard",        icon: Gamepad2     },
  { label: "Rooms",   href: "/dashboard/rooms",  icon: Globe        },
  { label: "Chat",    href: "/dashboard/chat",   icon: MessageSquare},
  { label: "Friends", href: "/dashboard/friends",icon: Users        },
];

// secondary nav — inside the More drawer
const SECONDARY_LINKS = [
  { label: "Stats",    href: "/dashboard/stats",    icon: BarChart2 },
  { label: "Settings", href: "/dashboard/settings", icon: Settings  },
];

// all links for desktop sidebar
const ALL_LINKS = [...PRIMARY_LINKS, ...SECONDARY_LINKS];

export function DashboardNav({ mobile = false }) {
  const pathname          = usePathname();
  const router            = useRouter();
  const { profile, logout } = useAuthStore();
  const avatar            = getAvatar(profile?.avatarId);
  const [moreOpen, setMoreOpen] = useState(false);

  async function handleLogout() {
    await logout();
    router.replace("/");
  }

  function handleNav(href) {
    router.push(href);
    setMoreOpen(false);
  }

  /* ── mobile bottom bar ────────────────────────────────── */
  if (mobile) {
    const isSecondaryActive = SECONDARY_LINKS.some((l) => pathname === l.href);

    return (
      <>
        {/* More drawer — slides up */}
        <AnimatePresence>
          {moreOpen && (
            <>
              {/* backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{   opacity: 0 }}
                onClick={() => setMoreOpen(false)}
                className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
              />

              {/* drawer */}
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0      }}
                exit={{   y: "100%"  }}
                transition={{ type: "spring", stiffness: 340, damping: 32 }}
                className="fixed left-0 right-0 z-50 bg-card border-t border-border rounded-t-lg overflow-hidden"
                style={{ bottom: `calc(3.5rem + env(safe-area-inset-bottom))` }}
              >
                {/* handle */}
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-8 h-1 rounded-full bg-border" />
                </div>

                <div className="px-4 pb-4 flex flex-col gap-1">
                  {/* secondary nav links */}
                  {SECONDARY_LINKS.map(({ label, href, icon: Icon }) => {
                    const active = pathname === href;
                    return (
                      <button
                        key={href}
                        onClick={() => handleNav(href)}
                        className={cn(
                          "flex items-center gap-4 px-4 py-3.5 rounded-sm transition-colors duration-150 text-left",
                          active
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-background hover:text-foreground"
                        )}
                      >
                        <Icon size={22} />
                        <span className="font-mono text-sm tracking-widest uppercase">
                          {label}
                        </span>
                      </button>
                    );
                  })}

                  <div className="h-px bg-border my-1" />

                  {/* profile */}
                  {profile && (
                    <button
                      onClick={() => handleNav(`/player/${profile.username}`)}
                      className="flex items-center gap-4 px-4 py-3.5 rounded-sm text-muted-foreground hover:bg-background hover:text-foreground transition-colors duration-150"
                    >
                      <div className="w-6 h-6 rounded-sm bg-primary/10 border border-primary/30 flex items-center justify-center text-base shrink-0">
                        {avatar.icon}
                      </div>
                      <div className="flex flex-col items-start min-w-0">
                        <span className="font-mono text-xs text-foreground truncate">
                          {profile.displayUsername}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground truncate">
                          View profile
                        </span>
                      </div>
                    </button>
                  )}

                  {/* logout */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-4 px-4 py-3.5 rounded-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-150"
                  >
                    <LogOut size={22} />
                    <span className="font-mono text-sm tracking-widest uppercase">
                      Logout
                    </span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* bottom bar */}
        <nav
          className="flex items-center justify-around bg-card border-t border-border px-2"
          style={{
            paddingBottom: "env(safe-area-inset-bottom)",
            minHeight:     "calc(3.5rem + env(safe-area-inset-bottom))",
          }}
        >
          {/* primary links */}
          {PRIMARY_LINKS.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <button
                key={href}
                onClick={() => router.push(href)}
                className="flex flex-col items-center gap-1 flex-1 py-2"
              >
                <motion.div
                  animate={{ color: active ? "var(--primary)" : "var(--muted-foreground)" }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon size={24} />
                </motion.div>
                <span className={cn(
                  "font-mono text-[9px] tracking-widest uppercase",
                  active ? "text-primary" : "text-muted-foreground"
                )}>
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

          {/* notification bell */}
          <div className="flex flex-col items-center gap-1 flex-1 py-2">
            <NotificationBell />
          </div>

          {/* more button */}
          <button
            onClick={() => setMoreOpen((p) => !p)}
            className="flex flex-col items-center gap-1 flex-1 py-2"
          >
            <motion.div
              animate={{ color: isSecondaryActive || moreOpen ? "var(--primary)" : "var(--muted-foreground)" }}
              transition={{ duration: 0.2 }}
            >
              {moreOpen ? <X size={24} /> : <MoreHorizontal size={24} />}
            </motion.div>
            <span className={cn(
              "font-mono text-[9px] tracking-widest uppercase",
              isSecondaryActive || moreOpen ? "text-primary" : "text-muted-foreground"
            )}>
              More
            </span>
            {isSecondaryActive && !moreOpen && (
              <motion.span
                layoutId="mobile-indicator"
                className="w-1 h-1 rounded-full bg-primary"
              />
            )}
          </button>
        </nav>
      </>
    );
  }

  /* ── desktop sidebar ──────────────────────────────────── */
  return (
    <nav
      className="w-60 h-screen sticky top-0 flex flex-col border-r border-border bg-card px-4 py-6 gap-2"
      style={{
        paddingTop:  "max(1.5rem, env(safe-area-inset-top))",
        paddingLeft: "max(1rem, env(safe-area-inset-left))",
      }}
    >
      {/* logo + bell */}
      <div className="px-3 mb-6 flex items-center justify-between">
        <div>
          <span className="font-heading text-xl font-black text-primary tracking-widest">
            GRIDLOCK
          </span>
          <span className="block font-mono text-[9px] text-muted-foreground tracking-widest mt-0.5">
            ONLINE GAME ARENA
          </span>
        </div>
        <NotificationBell />
      </div>

      {/* nav links */}
      <div className="flex flex-col gap-1 flex-1">
        {ALL_LINKS.map(({ label, href, icon: Icon }) => {
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
              <Icon size={18} />
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
          <LogOut size={18} />
          <span className="font-mono text-xs tracking-widest uppercase">Logout</span>
        </motion.button>
      </div>
    </nav>
  );
}