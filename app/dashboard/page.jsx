"use client";
import { useEffect }         from "react";
import { useRouter }         from "next/navigation";
import { motion }            from "motion/react";
import { useAuthStore }      from "@/store/useAuthStore";
import { PlayerStatsCard }   from "@/components/dashboard/PlayerStatsCard";
import { QuickPlay }         from "@/components/dashboard/QuickPlay";
import { ActiveRooms }       from "@/components/dashboard/ActiveRooms";
import { RecentGames }       from "@/components/dashboard/RecentGames";
import { FriendsList }       from "@/components/dashboard/FriendsList";
import { MyRooms }           from "@/components/dashboard/MyRooms";
import { getAvatar }         from "@/lib/avatars";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function DashboardPage() {
  const { user, profile, loading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [user, loading]);

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-primary"
          />
          <p className="font-mono text-xs text-muted-foreground tracking-widest">
            LOADING...
          </p>
        </div>
      </div>
    );
  }

  const avatar = getAvatar(profile.avatarId);

  return (
    <div className="relative min-h-screen">

      {/* scanlines */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, var(--primary) 2px, var(--primary) 3px)",
          backgroundSize: "100% 3px",
        }}
      />

      {/* radial glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 40% at 50% 0%, color-mix(in srgb, var(--primary) 5%, transparent) 0%, transparent 70%)",
        }}
      />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-8"
      >

        {/* ── HEADER ─────────────────────────────────────────── */}
        <motion.div
          variants={fadeUp}
          className="flex items-center justify-between flex-wrap gap-4"
        >
          <button onClick={()=> router.push(`/player/${profile.displayUsername}`)} className="flex items-center gap-4 cursor-pointer">
            {/* avatar */}
            <div className="w-14 h-14 rounded-sm bg-card border border-border flex items-center justify-center text-3xl shrink-0">
              {avatar.icon}
            </div>
            <div>
              <p className="font-mono text-xs text-muted-foreground tracking-widest mb-0.5">
                WELCOME BACK
              </p>
              <h1 className="font-heading text-2xl md:text-3xl font-black text-foreground tracking-tight leading-none">
                {profile.displayUsername.toUpperCase()}
                {profile.gamerTag && (
                  <span className="text-primary text-lg ml-2">{profile.gamerTag}</span>
                )}
              </h1>
              {profile.bio && (
                <p className="font-sans text-sm text-muted-foreground mt-1 max-w-sm truncate">
                  {profile.bio}
                </p>
              )}
            </div>
          </button>

          {/* live status pill */}
          <div className="flex items-center gap-2 bg-card border border-border rounded-sm px-4 py-2">
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-primary"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
            />
            <span className="font-mono text-xs text-muted-foreground tracking-widest">
              ONLINE
            </span>
          </div>
        </motion.div>

        {/* ── ROW 1 — STATS (full width) ─────────────────────── */}
        <motion.div variants={fadeUp}>
          <PlayerStatsCard />
        </motion.div>

        {/* ── ROW 2 — QUICK PLAY + MY ROOMS ──────────────────── */}
        <motion.div
          variants={fadeUp}
          className="grid grid-cols-1 xl:grid-cols-2 gap-6"
        >
          <QuickPlay />
          <ActiveRooms />
        </motion.div>

        {/* ── ROW 3 — DIVIDER LABEL ──────────────────────────── */}
        <motion.div variants={fadeUp} className="flex items-center gap-4">
          <span className="font-mono text-[10px] text-muted-foreground tracking-[0.3em] uppercase shrink-0">
            Arena
          </span>
          <div className="flex-1 h-px bg-border" />
        </motion.div>

        {/* ── ROW 4 — OPEN ROOMS + SIDEBAR ───────────────────── */}
        <motion.div
          variants={fadeUp}
          className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {/* open rooms — takes most space */}
          <div className="lg:col-span-2 xl:col-span-3">
          <MyRooms />
          </div>

          {/* sidebar — friends + recent games stacked */}
          <div className="flex flex-col gap-6">
            <FriendsList />
            <ActivityFeed />
            <RecentGames />
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}