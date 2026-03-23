"use client";
import { motion }            from "motion/react";
import { useEffect, useState } from "react";
import { useRouter }         from "next/navigation";
import { db }                from "@/lib/firebase";
import {
  collection, query, where, getDocs,
} from "firebase/firestore";
import { getAvatar }         from "@/lib/avatars";

export function ProfileFriends({ uid }) {
  const router = useRouter();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    async function load() {
      const [sentSnap, receivedSnap] = await Promise.all([
        getDocs(query(
          collection(db, "friendRequests"),
          where("fromUid", "==", uid),
          where("status",  "==", "accepted")
        )),
        getDocs(query(
          collection(db, "friendRequests"),
          where("toUid",  "==", uid),
          where("status", "==", "accepted")
        )),
      ]);

      const uids = [
        ...sentSnap.docs.map((d) => d.data().toUid),
        ...receivedSnap.docs.map((d) => d.data().fromUid),
      ];

      if (!uids.length) { setLoading(false); return; }

      const userDocs = await Promise.all(
        uids.map((id) =>
          getDocs(query(collection(db, "users"), where("uid", "==", id)))
        )
      );

      const users = userDocs
        .flatMap((s) => s.docs.map((d) => ({ uid: d.id, ...d.data() })))
        .filter(Boolean);

      setFriends(users);
      setLoading(false);
    }
    load();
  }, [uid]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="relative bg-card border border-border rounded-sm overflow-hidden"
    >
      <span className="absolute top-0 left-6 right-6 h-px bg-primary opacity-20" />
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <h3 className="font-heading text-xs font-black tracking-widest text-foreground">
          FRIENDS
        </h3>
        <span className="font-mono text-[10px] text-muted-foreground border border-border-game px-2 py-0.5 rounded-sm">
          {friends.length}
        </span>
      </div>

      {loading ? (
        <div className="px-6 py-6 flex items-center justify-center">
          <p className="font-mono text-xs text-muted-foreground animate-pulse">LOADING...</p>
        </div>
      ) : friends.length === 0 ? (
        <div className="px-6 py-6 text-center">
          <p className="font-mono text-xs text-muted-foreground tracking-widest">No friends yet.</p>
        </div>
      ) : (
        <div className="p-4 flex flex-wrap gap-3">
          {friends.slice(0, 12).map((f) => {
            const avatar = getAvatar(f.avatarId);
            return (
              <motion.button
                key={f.uid}
                onClick={() => router.push(`/player/${f.username}`)}
                whileHover={{ scale: 1.05 }}
                whileTap={{   scale: 0.95 }}
                title={f.displayUsername}
                className="flex flex-col items-center gap-1 group"
              >
                <div className="w-10 h-10 rounded-sm bg-background border border-border group-hover:border-primary flex items-center justify-center text-xl transition-colors duration-150">
                  {avatar.icon}
                </div>
                <span className="font-mono text-[9px] text-muted-foreground group-hover:text-primary transition-colors duration-150 max-w-[40px] truncate">
                  {f.displayUsername}
                </span>
              </motion.button>
            );
          })}
          {friends.length > 12 && (
            <div className="w-10 h-10 rounded-sm bg-background border border-border flex items-center justify-center">
              <span className="font-mono text-[9px] text-muted-foreground">
                +{friends.length - 12}
              </span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}