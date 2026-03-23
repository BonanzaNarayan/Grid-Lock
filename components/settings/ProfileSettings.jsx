"use client";
import { motion } from "motion/react";
import { useState } from "react";
import { useAuthStore }         from "@/store/useAuthStore";
import { AvatarPicker }         from "@/components/settings/AvatarPicker";
import { GameInput }            from "@/components/ui/GameInput";
import { GlowButton }           from "@/components/ui/GlowButton";
import { updateProfileSettings } from "@/lib/settingsService";
import { getAvatar }            from "@/lib/avatars";

export function ProfileSettings() {
  const { user, profile } = useAuthStore();

  const [avatarId,  setAvatarId]  = useState(profile?.avatarId  ?? "controller");
  const [username,  setUsername]  = useState(profile?.displayUsername ?? "");
  const [bio,       setBio]       = useState(profile?.bio       ?? "");
  const [gamerTag,  setGamerTag]  = useState(profile?.gamerTag  ?? "");
  const [loading,   setLoading]   = useState(false);
  const [errors,    setErrors]    = useState({});
  const [success,   setSuccess]   = useState(false);

  function validate() {
    const errs = {};
    if (!username.trim())           errs.username = "Username is required.";
    if (username.trim().length < 3) errs.username = "Username must be at least 3 characters.";
    if (bio.length > 120)           errs.bio      = "Bio must be 120 characters or less.";
    if (gamerTag.length > 20)       errs.gamerTag = "Gamer tag must be 20 characters or less.";
    return errs;
  }

  async function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    setLoading(true); setErrors({}); setSuccess(false);
    try {
      await updateProfileSettings(user.uid, {
        avatarId,
        username,
        bio,
        gamerTag,
        currentUsername: profile.displayUsername,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      if (err.message === "Username is already taken.") {
        setErrors({ username: err.message });
      } else {
        setErrors({ general: "Failed to save. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  }

  const avatar = getAvatar(avatarId);

  return (
    <div className="flex flex-col gap-8 max-w-2xl">

      {/* avatar */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <h3 className="font-heading text-xs font-black tracking-widest text-foreground">
            AVATAR
          </h3>
          <span className="font-mono text-[9px] text-muted-foreground border border-border-game px-1.5 py-0.5 rounded-sm">
            {AVATARS_COUNT}+ ICONS
          </span>
        </div>

        {/* current avatar preview */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 flex items-center justify-center bg-card border border-border rounded-sm text-4xl">
            {avatar.icon}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-xs text-foreground">{avatar.label}</span>
            <span className="font-mono text-[10px] text-muted-foreground">{avatar.category}</span>
          </div>
        </div>

        <AvatarPicker selected={avatarId} onSelect={setAvatarId} />
      </div>

      <div className="h-px bg-border" />

      {/* username */}
      <div className="flex flex-col gap-3">
        <h3 className="font-heading text-xs font-black tracking-widest text-foreground">
          USERNAME
        </h3>
        <GameInput
          label="Username"
          id="username"
          value={username}
          onChange={(e) => { setUsername(e.target.value); setErrors((p) => ({ ...p, username: null })); }}
          error={errors.username}
          placeholder="xX_Y0ur_N4me_Xx"
        />
      </div>

      <div className="h-px bg-border" />

      {/* bio */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-xs font-black tracking-widest text-foreground">
            BIO
          </h3>
          <span className={`font-mono text-[10px] ${bio.length > 120 ? "text-destructive" : "text-muted-foreground"}`}>
            {bio.length} / 120
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
            About you
          </label>
          <motion.div
            animate={{ borderColor: errors.bio ? "var(--destructive)" : "var(--border)" }}
            className="relative border rounded-sm overflow-hidden"
            style={{ borderColor: "var(--border)" }}
          >
            <textarea
              value={bio}
              onChange={(e) => { setBio(e.target.value); setErrors((p) => ({ ...p, bio: null })); }}
              placeholder="I live for the win..."
              rows={3}
              className="w-full bg-card text-text-primary font-sans text-base px-4 py-3 outline-none resize-none placeholder:text-muted-foreground"
            />
          </motion.div>
          {errors.bio && (
            <p className="font-mono text-xs text-destructive">{errors.bio}</p>
          )}
        </div>
      </div>

      <div className="h-px bg-border" />

      {/* gamer tag */}
      <div className="flex flex-col gap-3">
        <h3 className="font-heading text-xs font-black tracking-widest text-foreground">
          GAMER TAG
        </h3>
        <GameInput
          label="Tag"
          id="gamerTag"
          value={gamerTag}
          onChange={(e) => { setGamerTag(e.target.value); setErrors((p) => ({ ...p, gamerTag: null })); }}
          error={errors.gamerTag}
          placeholder="#GRID4821"
        />
        <p className="font-mono text-[10px] text-muted-foreground">
          A short unique tag displayed next to your username in games.
        </p>
      </div>

      {/* general error */}
      {errors.general && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1,  y: 0  }}
          className="font-mono text-xs text-destructive"
        >
          {errors.general}
        </motion.p>
      )}

      {/* success */}
      {success && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1,  y: 0  }}
          className="font-mono text-xs text-primary"
        >
          ✦ Profile saved successfully.
        </motion.p>
      )}

      <GlowButton onClick={handleSave} disabled={loading} className="w-fit">
        {loading ? "Saving..." : "Save Changes"}
      </GlowButton>
    </div>
  );
}

// count for the badge
const AVATARS_COUNT = (() => {
  const { AVATARS } = require("@/lib/avatars");
  return AVATARS.length;
})();