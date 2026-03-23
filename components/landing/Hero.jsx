"use client";
import { motion }        from "motion/react";
import { useRouter }     from "next/navigation";
import { GlowButton }    from "@/components/ui/GlowButton";
import { useAuthModal }  from "@/store/useAuthModal";
import { useAuthStore }  from "@/store/useAuthStore";

const container = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function Hero() {
  const { open }  = useAuthModal();
  const { user }  = useAuthStore();
  const router    = useRouter();

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16">

      {/* grid lines bg */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(var(--primary) 1px, transparent 1px), linear-gradient(90deg, var(--primary) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-4xl mx-auto flex flex-col items-center gap-6"
      >
        {/* eyebrow */}
        <motion.div variants={item}>
          <span className="font-mono text-xs tracking-[0.3em] uppercase text-primary border border-primary/30 bg-primary/10 px-4 py-1.5 rounded-sm">
            Online Multiplayer Gaming
          </span>
        </motion.div>

        {/* headline */}
        <motion.h1
          variants={item}
          className="font-heading text-5xl md:text-7xl font-black text-foreground leading-none tracking-tight"
        >
          PLAY.{" "}
          <span className="text-primary">CHALLENGE.</span>
          <br />
          DOMINATE.
        </motion.h1>

        {/* subtext */}
        <motion.p
          variants={item}
          className="font-sans text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed"
        >
          Classic games. Real opponents. No downloads.
          Jump in, create a room, and battle it out in real time.
        </motion.p>

        {/* CTAs */}
        <motion.div variants={item} className="flex flex-col sm:flex-row gap-4 mt-2">
          {user ? (
            // authenticated — go to dashboard or browse rooms
            <>
              <GlowButton
                onClick={() => router.push("/dashboard")}
                className="px-10 py-4 text-sm"
              >
                Go to Dashboard →
              </GlowButton>
              <GlowButton
                variant="ghost"
                onClick={() => router.push("/rooms")}
                className="px-10 py-4 text-sm"
              >
                Browse Live Rooms
              </GlowButton>
            </>
          ) : (
            // unauthenticated — signup + login
            <>
              <GlowButton
                onClick={() => open("signup")}
                className="px-10 py-4 text-sm"
              >
                Start Playing — It&apos;s Free
              </GlowButton>
              <GlowButton
                variant="ghost"
                onClick={() => open("login")}
                className="px-10 py-4 text-sm"
              >
                I Have an Account
              </GlowButton>
            </>
          )}
        </motion.div>

        {/* social proof */}
        <motion.p variants={item} className="font-mono text-xs text-muted-foreground tracking-widest">
          <span className="text-primary">1,240+</span> games played this week
        </motion.p>
      </motion.div>
    </section>
  );
}