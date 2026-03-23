"use client";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState }     from "react";
import { useAuthStore }            from "@/store/useAuthStore";
import { db }                      from "@/lib/firebase";
import {
  collection, query, where, onSnapshot,
} from "firebase/firestore";
import { joinRoom }          from "@/lib/roomService";
import { RoomsFilters }      from "@/components/rooms/RoomsFilters";
import { RoomCard }          from "@/components/rooms/RoomCard";
import { QuickJoinButton }   from "@/components/rooms/QuickJoinButton";

export function RoomsBrowser({ showQuickJoin = true, showFilters = true, limit: maxDisplay = 50 }) {
  const { user, profile }    = useAuthStore();
  const [rooms,    setRooms] = useState([]);
  const [loading,  setLoading] = useState(true);
  const [joining,  setJoining] = useState(null);
  const [error,    setError]   = useState(null);
  const [gameType, setGameType] = useState("all");
  const [search,   setSearch]  = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "rooms"),
      where("status",    "==", "waiting"),
      where("isPrivate", "==", false)
    );

    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) =>
          (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)
        );
      setRooms(docs);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  async function handleJoin(room) {
    if (joining) return;
    setJoining(room.id);
    setError(null);
    try {
      await joinRoom({ roomId: room.id, user, profile });
      window.open(`/room/${room.id}`, "_blank");
    } catch (err) {
      setError({ id: room.id, message: err.message ?? "Failed to join." });
    } finally {
      setJoining(null);
    }
  }

  // apply filters
  const filtered = rooms
    .filter((r) => gameType === "all" || r.gameType === gameType)
    .filter((r) =>
      !search.trim() ||
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.players?.X?.displayName?.toLowerCase().includes(search.toLowerCase())
    )
    .slice(0, maxDisplay);

  const isEmpty = !loading && filtered.length === 0;

  return (
    <div className="flex flex-col gap-6">

      {/* quick join + filters */}
      {(showQuickJoin || showFilters) && (
        <div className="flex flex-col gap-4">
          {showQuickJoin && user && (
            <QuickJoinButton rooms={rooms} />
          )}
          {showFilters && (
            <RoomsFilters
              gameType={gameType}
              onGameType={setGameType}
              search={search}
              onSearch={setSearch}
            />
          )}
        </div>
      )}

      {/* live indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <motion.span
            className="w-1.5 h-1.5 rounded-full bg-primary"
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          />
          <span className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase">
            Live
          </span>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">
          {loading ? "—" : `${filtered.length} open room${filtered.length !== 1 ? "s" : ""}`}
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* rooms grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-sm p-4 flex flex-col gap-3">
              <div className="flex gap-2">
                <div className="h-4 w-24 bg-border rounded-sm animate-pulse" />
                <div className="h-4 w-12 bg-border rounded-sm animate-pulse" />
              </div>
              <div className="flex gap-2 items-center">
                <div className="w-8 h-8 rounded-sm bg-border animate-pulse" />
                <div className="h-3 w-28 bg-border rounded-sm animate-pulse" />
              </div>
              <div className="flex gap-2">
                <div className="h-3 w-16 bg-border rounded-sm animate-pulse" />
                <div className="h-3 w-12 bg-border rounded-sm animate-pulse" />
              </div>
              <div className="h-8 bg-border rounded-sm animate-pulse mt-1" />
            </div>
          ))}
        </div>
      ) : isEmpty ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3 py-16"
        >
          <div className="w-12 h-12 rounded-sm bg-card border border-border flex items-center justify-center">
            <span className="font-mono text-lg text-muted-foreground">✕ ○</span>
          </div>
          <p className="font-mono text-xs text-muted-foreground tracking-widest text-center">
            {search ? "No rooms match your search." : "No open rooms right now."}
            <br />
            {user && !search && (
              <span className="text-primary">Create one from the dashboard!</span>
            )}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((room, i) => (
              <RoomCard
                key={room.id}
                room={room}
                index={i}
                onJoin={user ? handleJoin : null}
                joining={joining === room.id}
                isOwn={room.players?.X?.uid === user?.uid}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* per-room error */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1,  y: 0  }}
          className="font-mono text-xs text-destructive text-center"
        >
          {error.message}
        </motion.p>
      )}
    </div>
  );
}