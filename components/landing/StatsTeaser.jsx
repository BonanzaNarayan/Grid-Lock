"use client";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  watchGamesPlayed,
  watchActivePlayers,
  watchOpenRooms,
  watchLeaderboard,
} from "@/lib/publicStatsService";
import { getAvatar } from "@/lib/avatars";

// animated counter
function CountUp({ value, suffix = "" }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === 0) return;
    const duration = 1200;
    const start    = Date.now();
    const from     = display;

    const tick = () => {
      const elapsed  = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);

  return (
    <span>
      {display.toLocaleString()}{suffix}
    </span>
  );
}

const RANK_COLORS = [
  "text-yellow-400",
  "text-zinc-300",
  "text-amber-600",
];

const RANK_ICONS = ["👑", "②", "③"];

export function StatsTeaser() {
  const router = useRouter();

  const [gamesPlayed,    setGamesPlayed]    = useState(0);
  const [activePlayers,  setActivePlayers]  = useState(0);
  const [openRooms,      setOpenRooms]      = useState(0);
  const [topPlayers,     setTopPlayers]     = useState([]);
  const [loadingStats,   setLoadingStats]   = useState(true);
  const [loadingBoard,   setLoadingBoard]   = useState(true);

  useEffect(() => {
    const u1 = watchGamesPlayed((n)  => { setGamesPlayed(n);   setLoadingStats(false); });
    const u2 = watchActivePlayers((n) => setActivePlayers(n));
    const u3 = watchOpenRooms((n)    => setOpenRooms(n));
    const u4 = watchLeaderboard("tic-tac-toe", (players) => {
      setTopPlayers(players.slice(0, 10));
      setLoadingBoard(false);
    });
    return () => { u1(); u2(); u3(); u4(); };
  }, []);

  const stats = [
    { label: "Games Played",   value: gamesPlayed,   suffix: "+" },
    { label: "Active Players", value: activePlayers, suffix: ""  },
    { label: "Open Rooms",     value: openRooms,     suffix: ""  },
  ];

  return (
    <section className="py-24 px-6 flex flex-col items-center gap-16 max-w-5xl mx-auto w-full">

      {/* heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h2 className="font-heading text-3xl md:text-4xl font-black text-foreground tracking-tight">
          BY THE <span className="text-primary">NUMBERS</span>
        </h2>
        <p className="font-sans text-muted-foreground mt-3 text-sm">
          Live data — updated in real time
        </p>
      </motion.div>

      {/* stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="relative bg-card border border-border rounded-sm p-6 flex flex-col gap-2 overflow-hidden"
          >
            <span className="absolute top-0 left-4 right-4 h-px bg-primary opacity-20" />

            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {s.label}
            </span>

            {loadingStats ? (
              <div className="h-9 w-24 bg-border rounded-sm animate-pulse" />
            ) : (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 + 0.2 }}
                className="font-heading text-3xl font-black text-primary"
              >
                <CountUp value={s.value} suffix={s.suffix} />
              </motion.span>
            )}

            {/* live pulse indicator */}
            <div className="flex items-center gap-1.5 mt-1">
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-primary"
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              />
              <span className="font-mono text-[9px] text-muted-foreground tracking-widest">
                LIVE
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* leaderboard preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full bg-card border border-border rounded-sm overflow-hidden"
      >
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <span className="font-heading text-sm font-black tracking-widest text-foreground">
              TOP PLAYERS
            </span>
            <span className="font-mono text-[10px] text-muted-foreground border border-border-game px-2 py-0.5 rounded-sm">
              TIC-TAC-TOE
            </span>
          </div>
          <button
            onClick={() => router.push("/leaderboard")}
            className="font-mono text-[10px] text-primary hover:text-accent-game border border-primary/30 hover:border-accent-game/30 px-3 py-1.5 rounded-sm transition-colors duration-150"
          >
            Full Leaderboard →
          </button>
        </div>

        {/* column headers */}
        <div className="grid grid-cols-12 gap-2 px-6 py-2 border-b border-border bg-background">
          {["#", "Player", "W", "L", "Rate"].map((h, i) => (
            <span
              key={h}
              className={`font-mono text-[9px] uppercase tracking-widest text-muted-foreground
                ${i === 0 ? "col-span-1"
                : i === 1 ? "col-span-6"
                : i === 4 ? "col-span-2 text-right"
                : "col-span-1 text-center"}`}
            >
              {h}
            </span>
          ))}
        </div>

        {/* rows */}
        {loadingBoard ? (
          <div className="flex flex-col divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-6 py-3 flex items-center gap-3">
                <div className="w-6 h-6 rounded-sm bg-border animate-pulse" />
                <div className="w-8 h-8 rounded-sm bg-border animate-pulse" />
                <div className="flex-1 h-3 rounded-sm bg-border animate-pulse" />
                <div className="w-12 h-3 rounded-sm bg-border animate-pulse" />
              </div>
            ))}
          </div>
        ) : topPlayers.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="font-mono text-xs text-muted-foreground tracking-widest">
              No players yet. Be the first to play!
            </p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {topPlayers.map((p, i) => {
              const avatar = getAvatar(p.avatarId);
              return (
                <motion.div
                  key={p.uid}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="grid grid-cols-12 gap-2 items-center px-6 py-3 hover:bg-background transition-colors duration-150"
                >
                  {/* rank */}
                  <div className="col-span-1 flex items-center justify-center">
                    {i < 3 ? (
                      <span className={`font-heading text-sm font-black ${RANK_COLORS[i]}`}>
                        {RANK_ICONS[i]}
                      </span>
                    ) : (
                      <span className="font-mono text-xs text-muted-foreground">
                        {i + 1}
                      </span>
                    )}
                  </div>

                  {/* player */}
                  <div className="col-span-6 flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-sm bg-background border border-border flex items-center justify-center text-base shrink-0">
                      {avatar.icon}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-mono text-xs text-foreground truncate">
                        {p.displayUsername}
                      </span>
                      {p.gamerTag && (
                        <span className="font-mono text-[9px] text-muted-foreground">
                          {p.gamerTag}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* wins */}
                  <span className="col-span-1 font-mono text-xs text-primary text-center font-black">
                    {p.wins}
                  </span>

                  {/* losses */}
                  <span className="col-span-1 font-mono text-xs text-destructive text-center">
                    {p.losses}
                  </span>

                  {/* win rate */}
                  <div className="col-span-2 flex items-center gap-1.5 justify-end">
                    <div className="flex-1 h-1 bg-border rounded-full overflow-hidden max-w-12">
                      <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${p.rate}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, ease: "easeOut", delay: i * 0.04 }}
                      />
                    </div>
                    <span className="font-mono text-[10px] text-primary shrink-0">
                      {p.rate}%
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* footer CTA */}
        <div className="px-6 py-4 border-t border-border bg-background flex items-center justify-between">
          <span className="font-mono text-[10px] text-muted-foreground tracking-widest">
            Showing top {topPlayers.length} of all players
          </span>
          <button
            onClick={() => router.push("/leaderboard")}
            className="font-mono text-[10px] text-primary hover:text-accent-game transition-colors duration-150"
          >
            See full leaderboard →
          </button>
        </div>
      </motion.div>

    </section>
  );
}