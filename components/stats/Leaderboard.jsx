"use client";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState }  from "react";
import { useAuthStore }         from "@/store/useAuthStore";
import { watchLeaderboard, GAME_TYPES } from "@/lib/statsService";
import { PresenceDot }          from "@/components/friends/PresenceDot";
import { getAvatar }            from "@/lib/avatars";
import { Search, Crown }        from "lucide-react";

const GAME_LABELS = { "tic-tac-toe": "Tic-Tac-Toe" };
const RANGES      = [
  { id: "all",   label: "All Time"   },
  { id: "month", label: "This Month" },
  { id: "week",  label: "This Week"  },
];

const RANK_STYLES = [
  "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  "text-zinc-300   border-zinc-300/30   bg-zinc-300/10",
  "text-amber-600  border-amber-600/30  bg-amber-600/10",
];

export function Leaderboard() {
  const { user }  = useAuthStore();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [game,    setGame]    = useState(GAME_TYPES[0]);
  const [range,   setRange]   = useState("all");
  const [search,  setSearch]  = useState("");
  const [showTop, setShowTop] = useState(50);

  useEffect(() => {
    setLoading(true);
    const unsub = watchLeaderboard(game, (data) => {
      setPlayers(data);
      setLoading(false);
    });
    return () => unsub();
  }, [game]);

  // client-side range filter — in production you'd store weekly/monthly snapshots
  function inRange(p) {
    // range filtering would need timestamps on stats — for now all time is accurate
    // week/month show the same data with a note
    return true;
  }

  const filtered = players
    .filter(inRange)
    .filter((p) =>
      !search.trim() ||
      p.displayUsername?.toLowerCase().includes(search.toLowerCase()) ||
      p.gamerTag?.toLowerCase().includes(search.toLowerCase())
    )
    .slice(0, showTop);

  const myRank = players.findIndex((p) => p.uid === user?.uid) + 1;

  return (
    <div className="flex flex-col gap-5">

      {/* controls */}
      <div className="flex flex-wrap gap-3 items-center justify-between">

        {/* game type filter */}
        <div className="flex bg-background border border-border rounded-sm overflow-hidden">
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
        <div className="flex bg-background border border-border rounded-sm overflow-hidden">
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
          className="w-full bg-background border border-border rounded-sm pl-8 pr-4 py-2.5 font-mono text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors duration-150"
        />
      </div>

      {/* my rank callout */}
      {myRank > 0 && !search && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1,  y: 0  }}
          className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-sm px-4 py-2.5"
        >
          <span className="font-mono text-xs text-muted-foreground">Your rank</span>
          <div className="flex items-center gap-2">
            <span className="font-heading text-lg font-black text-primary">#{myRank}</span>
            <span className="font-mono text-[10px] text-muted-foreground">
              of {players.length} players
            </span>
          </div>
        </motion.div>
      )}

      {/* range note */}
      {range !== "all" && (
        <p className="font-mono text-[10px] text-muted-foreground tracking-widest">
          ✦ Weekly/monthly filtering requires stat snapshots — showing all-time data.
        </p>
      )}

      {/* table */}
      {loading ? (
        <div className="py-12 flex items-center justify-center">
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-primary"
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center">
          <p className="font-mono text-xs text-muted-foreground tracking-widest">
            No players found.
          </p>
        </div>
      ) : (
        <div className="flex flex-col">
          {/* header row */}
          <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-border">
            {["#", "Player", "W", "L", "D", "Rate"].map((h, i) => (
              <span
                key={h}
                className={`font-mono text-[10px] uppercase tracking-widest text-muted-foreground
                  ${i === 0 ? "col-span-1" : i === 1 ? "col-span-5" : "col-span-1 text-center"}`}
              >
                {h}
              </span>
            ))}
          </div>

          <AnimatePresence>
            {filtered.map((p, i) => {
              const avatar   = getAvatar(p.avatarId);
              const isMe     = p.uid === user?.uid;
              const rankStyle = i < 3 ? RANK_STYLES[i] : null;

              return (
                <motion.div
                  key={p.uid}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1,  x: 0  }}
                  exit={{   opacity: 0,   x: 8  }}
                  transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.3) }}
                  className={`grid grid-cols-12 gap-2 items-center px-4 py-3 border-b border-border last:border-0 transition-colors duration-150
                    ${isMe ? "bg-primary/5" : "hover:bg-background"}`}
                >
                  {/* rank */}
                  <div className="col-span-1 flex items-center">
                    {i < 3 ? (
                      <span className={`font-heading text-sm font-black w-6 h-6 rounded-sm border flex items-center justify-center ${rankStyle}`}>
                        {i === 0 ? <Crown size={12} /> : i + 1}
                      </span>
                    ) : (
                      <span className="font-mono text-xs text-muted-foreground w-6 text-center">
                        {i + 1}
                      </span>
                    )}
                  </div>

                  {/* player */}
                  <div className="col-span-5 flex items-center gap-2.5 min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-8 h-8 rounded-sm bg-card border border-border flex items-center justify-center text-base">
                        {avatar.icon}
                      </div>
                      <PresenceDot uid={p.uid} className="absolute -bottom-0.5 -right-0.5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className={`font-mono text-xs truncate ${isMe ? "text-primary font-black" : "text-foreground"}`}>
                        {p.displayUsername}
                        {isMe && <span className="text-muted-foreground font-normal"> (you)</span>}
                      </span>
                      {p.gamerTag && (
                        <span className="font-mono text-[9px] text-muted-foreground truncate">
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

                  {/* win rate */}
                  <div className="col-span-3 flex items-center gap-2">
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

      {/* load more / show top 50 toggle */}
      {!search && players.length > showTop && (
        <button
          onClick={() => setShowTop((p) => p + 50)}
          className="font-mono text-xs text-muted-foreground hover:text-primary text-center py-3 border border-border rounded-sm hover:border-primary transition-colors duration-150"
        >
          Show more ({players.length - showTop} remaining)
        </button>
      )}
      {!search && showTop > 50 && (
        <button
          onClick={() => setShowTop(50)}
          className="font-mono text-[10px] text-muted-foreground hover:text-primary text-center transition-colors duration-150"
        >
          Collapse to top 50
        </button>
      )}
    </div>
  );
}