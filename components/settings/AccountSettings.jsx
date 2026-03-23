"use client";
import { motion } from "motion/react";
import { useState } from "react";
import { useAuthStore }     from "@/store/useAuthStore";
import { GameInput }        from "@/components/ui/GameInput";
import { GlowButton }       from "@/components/ui/GlowButton";
import { updateUserEmail, updateUserPassword } from "@/lib/settingsService";

function SuccessMsg({ msg }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1,  y: 0  }}
      className="font-mono text-xs text-primary"
    >
      ✦ {msg}
    </motion.p>
  );
}

export function AccountSettings() {
  const { profile } = useAuthStore();

  // email section
  const [emailFields,   setEmailFields]   = useState({ currentPassword: "", newEmail: "" });
  const [emailErrors,   setEmailErrors]   = useState({});
  const [emailLoading,  setEmailLoading]  = useState(false);
  const [emailSuccess,  setEmailSuccess]  = useState(false);

  // password section
  const [passFields,    setPassFields]    = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passErrors,    setPassErrors]    = useState({});
  const [passLoading,   setPassLoading]   = useState(false);
  const [passSuccess,   setPassSuccess]   = useState(false);

  function setEmail(k, v) { setEmailFields((p) => ({ ...p, [k]: v })); setEmailErrors((p) => ({ ...p, [k]: null, general: null })); }
  function setPass(k, v)  { setPassFields((p)  => ({ ...p, [k]: v })); setPassErrors((p)  => ({ ...p, [k]: null, general: null })); }

  async function handleEmailUpdate() {
    const errs = {};
    if (!emailFields.currentPassword) errs.currentPassword = "Current password required.";
    if (!emailFields.newEmail.trim()) errs.newEmail         = "New email required.";
    if (Object.keys(errs).length) return setEmailErrors(errs);

    setEmailLoading(true);
    try {
      await updateUserEmail(emailFields.currentPassword, emailFields.newEmail);
      setEmailSuccess(true);
      setEmailFields({ currentPassword: "", newEmail: "" });
      setTimeout(() => setEmailSuccess(false), 3000);
    } catch (err) {
      const msg =
        err.code === "auth/wrong-password"    ? "Incorrect current password."
        : err.code === "auth/email-already-in-use" ? "Email already in use."
        : err.code === "auth/invalid-email"   ? "Invalid email address."
        : "Failed to update email.";
      setEmailErrors({ general: msg });
    } finally {
      setEmailLoading(false);
    }
  }

  async function handlePasswordUpdate() {
    const errs = {};
    if (!passFields.currentPassword)              errs.currentPassword = "Current password required.";
    if (passFields.newPassword.length < 6)        errs.newPassword     = "Password must be at least 6 characters.";
    if (passFields.newPassword !== passFields.confirmPassword)
      errs.confirmPassword = "Passwords do not match.";
    if (Object.keys(errs).length) return setPassErrors(errs);

    setPassLoading(true);
    try {
      await updateUserPassword(passFields.currentPassword, passFields.newPassword);
      setPassSuccess(true);
      setPassFields({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setPassSuccess(false), 3000);
    } catch (err) {
      const msg =
        err.code === "auth/wrong-password" ? "Incorrect current password."
        : "Failed to update password.";
      setPassErrors({ general: msg });
    } finally {
      setPassLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-10 max-w-2xl">

      {/* current email display */}
      <div className="flex flex-col gap-1 bg-background border border-border rounded-sm px-4 py-3">
        <span className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase">
          Current Email
        </span>
        <span className="font-mono text-sm text-foreground">{profile?.email}</span>
      </div>

      {/* update email */}
      <div className="flex flex-col gap-4">
        <h3 className="font-heading text-xs font-black tracking-widest text-foreground">
          CHANGE EMAIL
        </h3>
        <GameInput
          label="Current Password"
          id="ep-current"
          type="password"
          placeholder="••••••••"
          value={emailFields.currentPassword}
          onChange={(e) => setEmail("currentPassword", e.target.value)}
          error={emailErrors.currentPassword}
        />
        <GameInput
          label="New Email"
          id="ep-new"
          type="email"
          placeholder="new@example.com"
          value={emailFields.newEmail}
          onChange={(e) => setEmail("newEmail", e.target.value)}
          error={emailErrors.newEmail}
        />
        {emailErrors.general && (
          <p className="font-mono text-xs text-destructive">{emailErrors.general}</p>
        )}
        {emailSuccess && <SuccessMsg msg="Email updated successfully." />}
        <GlowButton onClick={handleEmailUpdate} disabled={emailLoading} className="w-fit">
          {emailLoading ? "Updating..." : "Update Email"}
        </GlowButton>
      </div>

      <div className="h-px bg-border" />

      {/* update password */}
      <div className="flex flex-col gap-4">
        <h3 className="font-heading text-xs font-black tracking-widest text-foreground">
          CHANGE PASSWORD
        </h3>
        <GameInput
          label="Current Password"
          id="pp-current"
          type="password"
          placeholder="••••••••"
          value={passFields.currentPassword}
          onChange={(e) => setPass("currentPassword", e.target.value)}
          error={passErrors.currentPassword}
        />
        <GameInput
          label="New Password"
          id="pp-new"
          type="password"
          placeholder="••••••••"
          value={passFields.newPassword}
          onChange={(e) => setPass("newPassword", e.target.value)}
          error={passErrors.newPassword}
        />
        <GameInput
          label="Confirm New Password"
          id="pp-confirm"
          type="password"
          placeholder="••••••••"
          value={passFields.confirmPassword}
          onChange={(e) => setPass("confirmPassword", e.target.value)}
          error={passErrors.confirmPassword}
        />
        {passErrors.general && (
          <p className="font-mono text-xs text-destructive">{passErrors.general}</p>
        )}
        {passSuccess && <SuccessMsg msg="Password updated successfully." />}
        <GlowButton onClick={handlePasswordUpdate} disabled={passLoading} className="w-fit">
          {passLoading ? "Updating..." : "Update Password"}
        </GlowButton>
      </div>
    </div>
  );
}