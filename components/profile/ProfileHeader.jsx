"use client";
import { motion }          from "motion/react";
import { getAvatar }       from "@/lib/avatars";
import { RankBadge }       from "@/components/profile/RankBadge";
import { PresenceDot }     from "@/components/friends/PresenceDot";
import { GlowButton }      from "@/components/ui/GlowButton";
import { getLevelProgress, getTotalXP } from "@/lib/levelService";

export function ProfileHeader({ profile, isOwnProfile, onAddFriend, friendStatus }) {
  const avatar   = getAvatar(profile.avatarId);
  const xp       = getTotalXP(profile.stats);
  const { level, progress, xpNeeded } = getLevelProgress(xp);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ duration: 0.4 }}
      className="relative bg-card border border-border rounded-sm p-6 flex flex-col gap-5 overflow-hidden"
    >
      <span className="absolute top-0 left-6 right-6 h-px bg-primary opacity-30" />

      {/* grid bg */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative flex flex-col sm:flex-row gap-5 items-start">
        {/* avatar */}
        <div className="relative shrink-0">
          <div className="w-20 h-20 rounded-sm bg-background border-2 border-border flex items-center justify-center text-5xl">
            {avatar.icon}
          </div>
          <PresenceDot
            uid={profile.uid}
            className="absolute -bottom-1 -right-1 w-3.5 h-3.5"
          />
          {/* level badge on avatar */}
          <span className="absolute -top-2 -left-2 font-heading text-[10px] font-black bg-primary text-primary-foreground px-1.5 py-0.5 rounded-sm">
            LVL {level}
          </span>
        </div>

        {/* info */}
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-xl md:text-2xl font-black text-foreground tracking-tight">
              {profile.displayUsername}
            </h1>
            {profile.gamerTag && (
              <span className="font-mono text-xs text-muted-foreground">
                {profile.gamerTag}
              </span>
            )}
          </div>

          <RankBadge level={level} size="sm" />

          {profile.bio && (
            <p className="font-sans text-sm text-muted-foreground max-w-md leading-relaxed">
              {profile.bio}
            </p>
          )}
        </div>
      </div>

      {/* XP progress bar */}
      <div className="relative flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase">
            Level {level} → {level + 1}
          </span>
          <span className="font-mono text-[10px] text-primary">
            {xpNeeded} XP to next level
          </span>
        </div>
        <div className="h-2 bg-background border border-border rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.3 }}
          />
        </div>
        <div className="flex justify-between">
          <span className="font-mono text-[9px] text-muted-foreground">
            {xp.toLocaleString()} XP total
          </span>
          <span className="font-mono text-[9px] text-muted-foreground">
            {progress}%
          </span>
        </div>
      </div>
    </motion.div>
  );
}