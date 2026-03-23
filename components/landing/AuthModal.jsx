"use client";
import { motion, AnimatePresence } from "motion/react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { GameInput }   from "@/components/ui/GameInput";
import { GlowButton }  from "@/components/ui/GlowButton";
import { useAuthModal } from "@/store/useAuthModal";
import { signUp, logIn, resetPassword } from "@/lib/authService";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function AuthModal() {
  const { isOpen, view, close, setView } = useAuthModal();
  const router = useRouter();

  const [fields, setFields] = useState({ email: "", password: "", username: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const isLogin  = view === "login";
  const isSignup = view === "signup";
  const isReset  = view === "reset";

  function set(field, value) {
    setFields((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: null, general: null }));
  }

  function validate() {
    const errs = {};
    if (isSignup && !fields.username.trim())
      errs.username = "Username is required.";
    if (isSignup && fields.username.trim().length < 3)
      errs.username = "Username must be at least 3 characters.";
    if (!fields.email.trim())
      errs.email = "Email is required.";
    if (!isReset && !fields.password)
      errs.password = "Password is required.";
    if (!isReset && fields.password.length < 6)
      errs.password = "Password must be at least 6 characters.";
    return errs;
  }

  async function handleSubmit() {
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);

    setLoading(true);
    try {
      if (isSignup) {
        await signUp(fields);
        close();
        router.push("/dashboard");
      } else if (isLogin) {
        await logIn(fields);
        close();
        router.push("/dashboard");
      } else if (isReset) {
        await resetPassword(fields.email);
        setResetSent(true);
      }
    } catch (err) {
      const msg =
        err.message === "Username is already taken."
          ? err.message
          : err.code === "auth/user-not-found"   ? "No account found with this email."
          : err.code === "auth/wrong-password"   ? "Incorrect password."
          : err.code === "auth/email-already-in-use" ? "Email already in use."
          : err.code === "auth/invalid-email"    ? "Invalid email address."
          : err.code === "auth/too-many-requests" ? "Too many attempts. Try again later."
          : "Something went wrong. Please try again.";

      // username taken → field error; everything else → general
      if (err.message === "Username is already taken.") {
        setErrors({ username: msg });
      } else {
        setErrors({ general: msg });
      }
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setFields({ email: "", password: "", username: "" });
    setErrors({});
    setResetSent(false);
    close();
  }

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="bg-card border border-border rounded-sm p-0 max-w-md w-full overflow-hidden">
        <span className="absolute top-0 left-0 right-0 h-px bg-primary opacity-40" />

        <div className="p-8 flex flex-col gap-6">

          {/* heading */}
          <div className="flex flex-col gap-1">
            <h2 className="font-heading text-2xl font-black text-foreground tracking-tight">
              {isLogin ? "WELCOME BACK"
               : isSignup ? "JOIN THE ARENA"
               : "RESET PASSWORD"}
            </h2>
            <p className="font-sans text-sm text-muted-foreground">
              {isLogin  ? "Enter your credentials to continue."
               : isSignup ? "Create your account to start playing."
               : "Enter your email and we'll send a reset link."}
            </p>
          </div>

          {/* fields */}
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4"
            >
              {isReset && resetSent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-primary/10 border border-primary/30 rounded-sm px-4 py-3"
                >
                  <p className="font-mono text-xs text-primary tracking-wide">
                    ✦ Reset link sent — check your inbox.
                  </p>
                </motion.div>
              ) : (
                <>
                  {isSignup && (
                    <GameInput
                      label="Username"
                      id="username"
                      type="text"
                      placeholder="xX_Y0ur_N4me_Xx"
                      value={fields.username}
                      onChange={(e) => set("username", e.target.value)}
                      error={errors.username}
                    />
                  )}

                  <GameInput
                    label="Email"
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={fields.email}
                    onChange={(e) => set("email", e.target.value)}
                    error={errors.email}
                  />

                  {!isReset && (
                    <GameInput
                      label="Password"
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={fields.password}
                      onChange={(e) => set("password", e.target.value)}
                      error={errors.password}
                    />
                  )}

                  {/* forgot password link */}
                  {isLogin && (
                    <button
                      onClick={() => { setErrors({}); setView("reset"); }}
                      className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors duration-150 text-right -mt-2"
                    >
                      Forgot password?
                    </button>
                  )}

                  {/* general error */}
                  {errors.general && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="font-mono text-xs text-destructive"
                    >
                      {errors.general}
                    </motion.p>
                  )}

                  <GlowButton
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full justify-center py-3.5 mt-1"
                  >
                    {loading
                      ? "Please wait..."
                      : isLogin  ? "Login"
                      : isSignup ? "Create Account"
                      : "Send Reset Link"}
                  </GlowButton>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* view toggle */}
          <p className="font-mono text-xs text-center text-muted-foreground tracking-wide">
            {isReset ? (
              <>
                Remembered it?{" "}
                <button
                  onClick={() => { setErrors({}); setResetSent(false); setView("login"); }}
                  className="text-primary hover:text-accent-game transition-colors duration-150"
                >
                  Back to login
                </button>
              </>
            ) : isLogin ? (
              <>
                No account yet?{" "}
                <button
                  onClick={() => { setErrors({}); setView("signup"); }}
                  className="text-primary hover:text-accent-game transition-colors duration-150"
                >
                  Sign up free
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => { setErrors({}); setView("login"); }}
                  className="text-primary hover:text-accent-game transition-colors duration-150"
                >
                  Login
                </button>
              </>
            )}
          </p>

        </div>
      </DialogContent>
    </Dialog>
  );
}