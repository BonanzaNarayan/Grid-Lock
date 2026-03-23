"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAuthStore }      from "@/store/useAuthStore";
import { watchAllUsers, sendFriendRequest } from "@/lib/friendsService";
import { watchFriendRequests } from "@/lib/friendsService";
import { PresenceDot }       from "@/components/friends/PresenceDot";
import { GameInput }         from "@/components/ui/GameInput";
import { GlowButton }        from "@/components/ui/GlowButton";
import { getAvatar }         from "@/lib/avatars";
import { Search }            from "lucide-react";

function getRequestStatus(uid, myUid, sent, received) {
  const sentReq     = sent.find((r)     => r.toUid   === uid);
  const receivedReq = received.find((r) => r.fromUid === uid);
  if (sentReq)     return { status: sentReq.status,     direction: "sent",     id: sentReq.id     };
  if (receivedReq) return { status: receivedReq.status, direction: "received", id: receivedReq.id };
  return null;
}

function AddButton({ req, onAdd, loading }) {
  if (!req)
    return <GlowButton variant="ghost" className="text-[10px] py-1 px-3" onClick={onAdd} disabled={loading}>
      {loading ? "..." : "Add"}
    </GlowButton>;

  if (req.direction === "received" && req.status === "pending")
    return <span className="font-mono text-[10px] text-accent-game border border-accent-game/30 bg-accent-game/10 px-2 py-1 rounded-sm">Respond ↓</span>;

  const map = {
    pending:  { label: "Request Sent", color: "text-muted-foreground border-border-game" },
    accepted: { label: "Friends ✦",    color: "text-primary border-primary/30 bg-primary/10" },
    rejected: { label: "Add",          color: "text-muted-foreground border-border-game" },
  };
  const style = map[req.status] ?? map.pending;

  if (req.status === "rejected")
    return <GlowButton variant="ghost" className="text-[10px] py-1 px-3" onClick={onAdd} disabled={loading}>
      {loading ? "..." : "Add"}
    </GlowButton>;

  return <span className={`font-mono text-[10px] border px-2 py-1 rounded-sm ${style.color}`}>{style.label}</span>;
}

export function FindFriends() {
  const { user } = useAuthStore();
  const [users,    setUsers]    = useState([]);
  const [requests, setRequests] = useState({ sent: [], received: [] });
  const [search,   setSearch]   = useState("");
  const [loading,  setLoading]  = useState({});

  useEffect(() => {
    const u1 = watchAllUsers(setUsers);
    const u2 = watchFriendRequests(user.uid, setRequests);
    return () => { u1(); u2(); };
  }, [user.uid]);

  const filtered = users
    .filter((u) => u.uid !== user.uid)
    .filter((u) =>
      !search.trim() ||
      u.displayUsername?.toLowerCase().includes(search.toLowerCase()) ||
      u.gamerTag?.toLowerCase().includes(search.toLowerCase())
    );

  async function handleAdd(toUid) {
    setLoading((p) => ({ ...p, [toUid]: true }));
    try {
      await sendFriendRequest(user.uid, toUid);
    } catch {}
    finally { setLoading((p) => ({ ...p, [toUid]: false })); }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by username or tag..."
          className="w-full bg-background border border-border rounded-sm pl-9 pr-4 py-2.5 font-mono text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors duration-150"
        />
      </div>

      {/* list */}
      <div className="flex flex-col divide-y divide-border">
        {filtered.length === 0 ? (
          <p className="font-mono text-xs text-muted-foreground text-center py-8 tracking-widest">
            No users found.
          </p>
        ) : (
          filtered.map((u, i) => {
            const avatar = getAvatar(u.avatarId);
            const req    = getRequestStatus(u.uid, user.uid, requests.sent, requests.received);
            return (
              <motion.div
                key={u.uid}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
                className="flex items-center justify-between py-3 gap-3"
              >
                {/* avatar + info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-sm bg-card border border-border flex items-center justify-center text-xl shrink-0">
                      {avatar.icon}
                    </div>
                    <PresenceDot uid={u.uid} className="absolute -bottom-0.5 -right-0.5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-mono text-xs text-foreground truncate">
                      {u.displayUsername}
                    </span>
                    {u.gamerTag && (
                      <span className="font-mono text-[10px] text-muted-foreground">{u.gamerTag}</span>
                    )}
                  </div>
                </div>
                {/* action */}
                <AddButton req={req} onAdd={() => handleAdd(u.uid)} loading={!!loading[u.uid]} />
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}