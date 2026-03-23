"use client";
import { useState, useEffect } from "react";
import { useRouter }           from "next/navigation";
import { useAuthStore }        from "@/store/useAuthStore";
import { FriendsTabs }         from "@/components/friends/FriendsTabs";
import { FindFriends }         from "@/components/friends/FindFriends";
import { FriendsList }         from "@/components/friends/FriendsList";
import { FriendRequests }      from "@/components/friends/FriendRequests";
import { motion, AnimatePresence } from "motion/react";
import { useState as useStateR, useEffect as useEffectR } from "react";

export default function FriendsPage() {
  const { user, loading } = useAuthStore();
  const router = useRouter();
  const [tab,          setTab]          = useStateR("find");
  const [requestCount, setRequestCount] = useStateR(0);

  useEffectR(() => {
    if (!loading && !user) router.replace("/");
  }, [user, loading]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <p className="font-mono text-xs text-muted-foreground tracking-widest animate-pulse">
        LOADING...
      </p>
    </div>
  );

  return (
    <div className="relative min-h-screen">
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, var(--primary) 2px, var(--primary) 3px)",
          backgroundSize: "100% 3px",
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-6">

        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-black text-foreground tracking-tight">
            FRIENDS
          </h1>
          <p className="font-mono text-xs text-muted-foreground tracking-widest mt-1">
            FIND, ADD AND CHAT WITH PLAYERS
          </p>
        </div>

        <div className="relative bg-card border border-border rounded-sm overflow-hidden">
          <span className="absolute top-0 left-6 right-6 h-px bg-primary opacity-20" />

          <FriendsTabs
            active={tab}
            onChange={setTab}
            requestCount={requestCount}
          />

          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 8  }}
                animate={{ opacity: 1, y: 0  }}
                exit={{   opacity: 0, y: -8  }}
                transition={{ duration: 0.2 }}
              >
                {tab === "find"     && <FindFriends />}
                {tab === "friends"  && <FriendsList />}
                {tab === "requests" && <FriendRequests onCountChange={setRequestCount} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}