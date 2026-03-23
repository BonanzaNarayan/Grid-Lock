"use client";
import { useState, useEffect }  from "react";
import { useRouter }            from "next/navigation";
import { useAuthStore }         from "@/store/useAuthStore";
import { SettingsTabs }         from "@/components/settings/SettingsTabs";
import { ProfileSettings }      from "@/components/settings/ProfileSettings";
import { AccountSettings }      from "@/components/settings/AccountSettings";
import { DangerZone }           from "@/components/settings/DangerZone";
import { motion, AnimatePresence } from "motion/react";

const VIEWS = {
  profile: <ProfileSettings />,
  account: <AccountSettings />,
  danger:  <DangerZone />,
};

export default function SettingsPage() {
  const { user, loading } = useAuthStore();
  const router            = useRouter();
  const [tab, setTab]     = useState("profile");

  useEffect(() => {
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

      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-6">

        {/* heading */}
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-black text-foreground tracking-tight">
            SETTINGS
          </h1>
          <p className="font-mono text-xs text-muted-foreground tracking-widest mt-1">
            MANAGE YOUR ACCOUNT
          </p>
        </div>

        {/* card */}
        <div className="relative bg-card border border-border rounded-sm overflow-hidden">
          <span className="absolute top-0 left-6 right-6 h-px bg-primary opacity-20" />

          <SettingsTabs active={tab} onChange={setTab} />

          <div className="p-6 md:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 8  }}
                animate={{ opacity: 1, y: 0  }}
                exit={{   opacity: 0, y: -8  }}
                transition={{ duration: 0.2 }}
              >
                {VIEWS[tab]}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}