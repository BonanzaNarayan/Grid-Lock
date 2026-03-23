"use client";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useAuthStore }    from "@/store/useAuthStore";
import { watchFriendRequests, acceptFriendRequest, rejectFriendRequest } from "@/lib/friendsService";
import { watchAllUsers }   from "@/lib/friendsService";
import { GlowButton }      from "@/components/ui/GlowButton";
import { PresenceDot }     from "@/components/friends/PresenceDot";
import { getAvatar }       from "@/lib/avatars";

export function FriendRequests({ onCountChange }) {
  const { user }   = useAuthStore();
  const [requests, setRequests] = useState({ sent: [], received: [] });
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState({});

  useEffect(() => {
    const u1 = watchFriendRequests(user.uid, (r) => {
      setRequests(r);
      onCountChange?.(r.received.filter((x) => x.status === "pending").length);
    });
    const u2 = watchAllUsers(setUsers);
    return () => { u1(); u2(); };
  }, [user.uid]);

  function getUser(uid) {
    return users.find((u) => u.uid === uid);
  }

  async function handleAccept(id) {
    setLoading((p) => ({ ...p, [id]: "accept" }));
    try { await acceptFriendRequest(id); }
    finally { setLoading((p) => ({ ...p, [id]: null })); }
  }

  async function handleReject(id) {
    setLoading((p) => ({ ...p, [id]: "reject" }));
    try { await rejectFriendRequest(id); }
    finally { setLoading((p) => ({ ...p, [id]: null })); }
  }

  const pending  = requests.received.filter((r) => r.status === "pending");
  const sentReqs = requests.sent.filter((r) => r.status === "pending");

  return (
    <div className="flex flex-col gap-6">

      {/* incoming */}
      <div className="flex flex-col gap-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Incoming ({pending.length})
        </span>
        {pending.length === 0 ? (
          <p className="font-mono text-xs text-muted-foreground text-center py-6 tracking-widest">
            No pending requests.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {pending.map((req, i) => {
              const u      = getUser(req.fromUid);
              const avatar = getAvatar(u?.avatarId);
              return (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1,  x: 0  }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between py-3 gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-sm bg-card border border-border flex items-center justify-center text-xl shrink-0">
                        {avatar.icon}
                      </div>
                      <PresenceDot uid={req.fromUid} className="absolute -bottom-0.5 -right-0.5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-mono text-xs text-foreground">
                        {u?.displayUsername ?? "Unknown"}
                      </span>
                      {u?.gamerTag && (
                        <span className="font-mono text-[10px] text-muted-foreground">{u.gamerTag}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <GlowButton
                      className="text-[10px] py-1 px-3"
                      disabled={!!loading[req.id]}
                      onClick={() => handleAccept(req.id)}
                    >
                      {loading[req.id] === "accept" ? "..." : "Accept"}
                    </GlowButton>
                    <GlowButton
                      variant="danger"
                      className="text-[10px] py-1 px-3"
                      disabled={!!loading[req.id]}
                      onClick={() => handleReject(req.id)}
                    >
                      {loading[req.id] === "reject" ? "..." : "Reject"}
                    </GlowButton>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* sent */}
      {sentReqs.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Sent ({sentReqs.length})
          </span>
          <div className="flex flex-col divide-y divide-border">
            {sentReqs.map((req, i) => {
              const u      = getUser(req.toUid);
              const avatar = getAvatar(u?.avatarId);
              return (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1,  x: 0  }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between py-3 gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-sm bg-card border border-border flex items-center justify-center text-xl shrink-0">
                      {avatar.icon}
                    </div>
                    <span className="font-mono text-xs text-foreground">
                      {u?.displayUsername ?? "Unknown"}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground border border-border-game px-2 py-1 rounded-sm">
                    Pending
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}