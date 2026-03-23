"use client";
import { useEffect, useState }  from "react";
import { useRouter }            from "next/navigation";
import { motion }               from "motion/react";
import { db }                   from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useAuthStore }         from "@/store/useAuthStore";
import { sendFriendRequest, watchFriendRequests } from "@/lib/friendsService";
import { ScanlinesBg }          from "@/components/ui/ScanlinesBg";
import { Navbar }               from "@/components/landing/Navbar";
import { AuthModal }            from "@/components/landing/AuthModal";
import { ProfileHeader }        from "@/components/profile/ProfileHeader";
import { ProfileStats }         from "@/components/profile/ProfileStats";
import { ProfileRecentGames }   from "@/components/profile/ProfileRecentGames";
import { ProfileFriends }       from "@/components/profile/ProfileFriends";
import { ChallengeButton }      from "@/components/social/ChallengeButton";

export function PublicProfilePage({ username }) {
  const router             = useRouter();
  const { user }           = useAuthStore();
  const [profile,  setProfile]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [requests, setRequests] = useState({ sent: [], received: [] });

  // load profile by username
  useEffect(() => {
    async function load() {
      const q    = query(
        collection(db, "users"),
        where("username", "==", username.toLowerCase())
      );
      const snap = await getDocs(q);
      if (snap.empty) { setNotFound(true); setLoading(false); return; }
      setProfile({ uid: snap.docs[0].id, ...snap.docs[0].data() });
      setLoading(false);
    }
    load();
  }, [username]);

  // watch friend requests if logged in
  useEffect(() => {
    if (!user) return;
    return watchFriendRequests(user.uid, setRequests);
  }, [user]);

  function getFriendStatus() {
    if (!user || !profile) return null;
    const sent = requests.sent.find((r) => r.toUid === profile.uid);
    if (sent) return sent.status;
    const recv = requests.received.find((r) => r.fromUid === profile.uid);
    if (recv) return recv.status;
    return null;
  }

  async function handleAddFriend() {
    if (!user) return;
    await sendFriendRequest(user.uid, profile.uid);
  }

  const isOwnProfile   = user?.uid === profile?.uid;
  const friendStatus   = getFriendStatus();
  const isAccepted     = friendStatus === "accepted";

  if (loading) return (
    <ScanlinesBg>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          className="w-2 h-2 rounded-full bg-primary"
        />
      </div>
    </ScanlinesBg>
  );

  if (notFound) return (
    <ScanlinesBg>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="font-heading text-2xl font-black text-foreground">Player not found.</p>
        <button
          onClick={() => router.push("/")}
          className="font-mono text-xs text-primary hover:text-accent-game transition-colors duration-150"
        >
          ← Back to home
        </button>
      </div>
    </ScanlinesBg>
  );

  return (
    <ScanlinesBg>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 md:px-8 pt-28 pb-16 flex flex-col gap-6">

        <ProfileHeader
          profile={profile}
          isOwnProfile={isOwnProfile}
          friendStatus={friendStatus}
          onAddFriend={handleAddFriend}
          // override the challenge button with the full component
        />

        {/* inject challenge button into header for accepted friends */}
        {!isOwnProfile && isAccepted && user && (
          <div className="-mt-4 flex justify-start px-1">
            <ChallengeButton toProfile={profile} />
          </div>
        )}

        {/* stats + recent games */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProfileStats stats={profile.stats} />
          <ProfileRecentGames uid={profile.uid} />
        </div>

        {/* friends */}
        <ProfileFriends uid={profile.uid} />

      </main>
      <AuthModal />
    </ScanlinesBg>
  );
}