"use client";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState }     from "react";
import { useRouter }               from "next/navigation";
import { watchLeaderboard, GAME_TYPES } from "@/lib/statsService";
import {
  watchGamesPlayed,
  watchActivePlayers,
  watchOpenRooms,
} from "@/lib/publicStatsService";
import { getAvatar }    from "@/lib/avatars";
import { PresenceDot }  from "@/components/friends/PresenceDot";
import { useAuthModal } from "@/store/useAuthModal";
import { Search, Crown, Trophy, Zap } from "lucide-react";

const GAME_LABELS = { "tic-tac-toe": "Tic-Tac-Toe" };
const RANK_STYLES = [
  { text: "text-yellow-400", border: "border-yellow-400/40 bg-yellow-400/10" },
  { text: "text-zinc-300",   border: "border-zinc-300/40   bg-zinc-300/10"   },
  { text: "text-amber-600",  border: "border-amber-600/40  bg-amber-600/10"  },
];

const RANGES = [
  { id: "all",   label: "All Time"    },
  { id: "month", label: "This Month"  },
  { id: "week",  label: "This Week"   },
];

export function PublicLeaderboard() {
  const router      = useRouter();
  const { open }    = useAuthModal();

  const [players,  setPlayers]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [game,     setGame]     = useState(GAME_TYPES[0]);
  const [range,    setRange]    = useState("all");
  const [search,   setSearch]   = useState("");
  const [showTop,  setShowTop]  = useState(50);

  // live platform stats
  const [gamesPlayed,   setGamesPlayed]   = useState(0);
  const [activePlayers, setActivePlayers] = useState(0);
  const [openRooms,     setOpenRooms]     = useState(0);

  useEffect(() => {
    const u1 = watchGamesPlayed(setGamesPlayed);
    const u2 = watchActivePlayers(setActivePlayers);
    const u3 = watchOpenRooms(setOpenRooms);
    return () => { u1(); u2(); u3(); };
  }, []);

  useEffect(() => {
    setLoading(true);
    const unsub = watchLeaderboard(game, (data) => {
      setPlayers(data);
      setLoading(false);
    });
    return () => unsub();
  }, [game]);

  const filtered = players
    .filter((p) =>
      !search.trim() ||
      p.displayUsername?.toLowerCase().includes(search.toLowerCase()) ||
      p.gamerTag?.toLowerCase().includes(search.toLowerCase())
    )
    .slice(0, showTop);

  const top3 = players.slice(0, 3);

  return (
    <div className="flex flex-col gap-12">

      {/* ── HERO PODIUM ──────────────────────────────────── */}
      {!loading && top3.length >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-8"
        >
          <h2 className="font-heading text-2xl md:text-3xl font-black text-foreground tracking-tight text-center">
            THIS WEEK&apos;S <span className="text-primary">CHAMPIONS</span>
          </h2>

          {/* podium */}
          <div className="flex items-end justify-center gap-3 w-full max-w-lg">
            {/* 2nd */}
            {[1, 0, 2].map((rankIdx) => {
              const p      = top3[rankIdx];
              if (!p) return null;
              const avatar = getAvatar(p.avatarId);
              const style  = RANK_STYLES[rankIdx];
              const heights = { 0: "h-32", 1: "h-24", 2: "h-20" };
              const sizes   = { 0: "text-5xl w-16 h-16", 1: "text-4xl w-14 h-14", 2: "text-3xl w-12 h-12" };

              return (
                <motion.div
                  key={p.uid}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0  }}
                  transition={{ duration: 0.5, delay: rankIdx * 0.1 }}
                  className="flex flex-col items-center gap-2 flex-1"
                >
                  {/* avatar */}
                  <div className={`relative ${sizes[rankIdx]} rounded-sm bg-card border-2 ${style.border} flex items-center justify-center`}>
                    <span className={sizes[rankIdx].split(" ")[0]}>{avatar.icon}</span>
                    <PresenceDot uid={p.uid} className="absolute -bottom-1 -right-1 w-2.5 h-2.5" />
                  </div>

                  {/* name */}
                  <div className="text-center">
                    <p className={`font-mono text-xs font-black truncate max-w-20 ${style.text}`}>
                      {p.displayUsername}
                    </p>
                    <p className="font-mono text-[9px] text-muted-foreground">
                      {p.wins}W · {p.rate}%
                    </p>
                  </div>

                  {/* podium block */}
                  <div className={`w-full ${heights[rankIdx]} bg-card border border-border rounded-t-sm flex items-center justify-center relative overflow-hidden`}>
                    <span className="absolute top-0 left-0 right-0 h-px bg-primary opacity-20" />
                    {rankIdx === 0 ? (
                      <Crown size={20} className="text-yellow-400" />
                    ) : (
                      <span className={`font-heading text-2xl font-black ${style.text}`}>
                        {rankIdx + 1}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── LIVE STATS STRIP ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-3 gap-4"
      >
        {[
          { label: "Games Played",   value: gamesPlayed.toLocaleString(),   icon: Trophy },
          { label: "Players Online", value: activePlayers.toLocaleString(), icon: Zap    },
          { label: "Open Rooms",     value: openRooms.toLocaleString(),     icon: Crown  },
        ].map(({ label, value, icon: Icon }, i) => (
          <div
            key={label}
            className="relative bg-card border border-border rounded-sm px-4 py-3 flex flex-col gap-1"
          >
            <span className="absolute top-0 left-3 right-3 h-px bg-primary opacity-20" />
            <div className="flex items-center gap-1.5">
              <Icon size={11} className="text-muted-foreground" />
              <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                {label}
              </span>
            </div>
            <span className="font-heading text-xl font-black text-primary">{value}</span>
            <div className="flex items-center gap-1">
              <motion.span
                className="w-1 h-1 rounded-full bg-primary"
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
              />
              <span className="font-mono text-[9px] text-muted-foreground">LIVE</span>
            </div>
          </div>
        ))}
      </motion.div>

      {/* ── FULL TABLE ───────────────────────────────────── */}
      <div className="flex flex-col gap-5">

        {/* controls */}
        <div className="flex flex-wrap gap-3 items-center justify-between">
          {/* game filter */}
          <div className="flex bg-card border border-border rounded-sm overflow-hidden">
            {GAME_TYPES.map((gt) => (
              <button
                key={gt}
                onClick={() => setGame(gt)}
                className={`font-mono text-xs tracking-widest uppercase px-4 py-2 transition-colors duration-150
                  ${game === gt ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {GAME_LABELS[gt] ?? gt}
              </button>
            ))}
          </div>

          {/* time range */}
          <div className="flex bg-card border border-border rounded-sm overflow-hidden">
            {RANGES.map((r) => (
              <button
                key={r.id}
                onClick={() => setRange(r.id)}
                className={`font-mono text-[10px] tracking-widest uppercase px-3 py-2 transition-colors duration-150
                  ${range === r.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* search */}
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search player or tag..."
            className="w-full bg-card border border-border rounded-sm pl-8 pr-4 py-2.5 font-mono text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors duration-150"
          />
        </div>

        {range !== "all" && (
          <p className="font-mono text-[10px] text-muted-foreground tracking-widest">
            ✦ Weekly/monthly filtering requires stat snapshots — showing all-time data.
          </p>
        )}

        {/* table */}
        <div className="bg-card border border-border rounded-sm overflow-hidden">
          <span className="block h-px bg-primary opacity-20" />

          {/* col headers */}
          <div className="grid grid-cols-12 gap-2 px-6 py-3 border-b border-border bg-background">
            {["#", "Player", "W", "L", "D", "Rate"].map((h, i) => (
              <span
                key={h}
                className={`font-mono text-[9px] uppercase tracking-widest text-muted-foreground
                  ${i === 0 ? "col-span-1"
                  : i === 1 ? "col-span-5"
                  : i === 5 ? "col-span-3 text-right"
                  : "col-span-1 text-center"}`}
              >
                {h}
              </span>
            ))}
          </div>

          {loading ? (
            <div className="flex flex-col divide-y divide-border">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="px-6 py-3 flex items-center gap-3">
                  <div className="w-6 h-4 rounded bg-border animate-pulse" />
                  <div className="w-8 h-8 rounded-sm bg-border animate-pulse" />
                  <div className="flex-1 h-3 rounded bg-border animate-pulse" />
                  <div className="w-16 h-3 rounded bg-border animate-pulse" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-mono text-xs text-muted-foreground tracking-widest">
                No players found.
              </p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              <AnimatePresence>
                {filtered.map((p, i) => {
                  const avatar     = getAvatar(p.avatarId);
                  const rankStyle  = i < 3 ? RANK_STYLES[i] : null;

                  return (
                    <motion.div
                      key={p.uid}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1,  x: 0  }}
                      exit={{   opacity: 0,   x: 8  }}
                      transition={{ duration: 0.2, delay: Math.min(i * 0.025, 0.25) }}
                      className="grid grid-cols-12 gap-2 items-center px-6 py-3 hover:bg-background transition-colors duration-150"
                    >
                      {/* rank */}
                      <div className="col-span-1 flex items-center justify-center">
                        {i < 3 ? (
                          <span className={`font-heading text-sm font-black w-7 h-7 rounded-sm border flex items-center justify-center ${rankStyle.text} ${rankStyle.border}`}>
                            {i === 0 ? <Crown size={13} /> : i + 1}
                          </span>
                        ) : (
                          <span className="font-mono text-xs text-muted-foreground text-center w-full">
                            {i + 1}
                          </span>
                        )}
                      </div>

                      {/* player */}
                      <div className="col-span-5 flex items-center gap-2.5 min-w-0">
                        <div className="relative shrink-0">
                          <div className="w-9 h-9 rounded-sm bg-background border border-border flex items-center justify-center text-lg">
                            {avatar.icon}
                          </div>
                          <PresenceDot uid={p.uid} className="absolute -bottom-0.5 -right-0.5" />
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

                      {/* draws */}
                      <span className="col-span-1 font-mono text-xs text-muted-foreground text-center">
                        {p.draws}
                      </span>

                      {/* rate bar */}
                      <div className="col-span-3 flex items-center gap-2 justify-end">
                        <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-primary rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${p.rate}%` }}
                            transition={{ duration: 0.6, ease: "easeOut", delay: Math.min(i * 0.02, 0.2) }}
                          />
                        </div>
                        <span className="font-mono text-[10px] text-primary w-8 text-right shrink-0">
                          {p.rate}%
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {/* footer */}
          {!search && players.length > showTop && (
            <div className="px-6 py-4 border-t border-border bg-background">
              <button
                onClick={() => setShowTop((p) => p + 50)}
                className="w-full font-mono text-xs text-muted-foreground hover:text-primary transition-colors duration-150 text-center"
              >
                Show more ({players.length - showTop} remaining)
              </button>
            </div>
          )}
        </div>

        {/* CTA for non-logged-in users */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="relative bg-card border border-border rounded-sm px-6 py-8 flex flex-col items-center gap-4 overflow-hidden"
        >
          <span className="absolute top-0 left-6 right-6 h-px bg-primary opacity-30" />
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.04]"
            style={{
              backgroundImage: "linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <p className="font-heading text-lg font-black text-foreground tracking-tight text-center relative z-10">
            THINK YOU CAN CLAIM THE <span className="text-primary">TOP SPOT?</span>
          </p>
          <p className="font-sans text-sm text-muted-foreground text-center relative z-10">
            Create a free account and start climbing the leaderboard.
          </p>
          <button
            onClick={() => open("signup")}
            className="relative z-10 font-heading text-sm font-bold tracking-widest uppercase bg-primary text-primary-foreground px-8 py-3 rounded-sm hover:bg-primary-dim transition-colors duration-200"
          >
            Join for Free
          </button>
        </motion.div>
      </div>
    </div>
  );
}