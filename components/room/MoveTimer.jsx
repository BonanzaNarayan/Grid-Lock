"use client";
import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { useEffect, useRef } from "react";

export function MoveTimer({ timerSecs, turnStartedAt, isMyTurn, onExpire }) {
  const progress    = useMotionValue(1);
  const intervalRef = useRef(null);

  const color = useTransform(
    progress,
    [0, 0.25, 0.5, 1],
    ["var(--destructive)", "var(--player-x)", "var(--accent-game)", "var(--primary)"]
  );

  useEffect(() => {
    if (!turnStartedAt) return;
    const startMs = turnStartedAt.toMillis?.() ?? Date.now();

    function tick() {
      const elapsed  = (Date.now() - startMs) / 1000;
      const remaining = Math.max(0, timerSecs - elapsed);
      const p         = remaining / timerSecs;
      progress.set(p);

      if (remaining <= 0) {
        clearInterval(intervalRef.current);
        if (isMyTurn) onExpire?.();
      }
    }

    tick();
    intervalRef.current = setInterval(tick, 200);
    return () => clearInterval(intervalRef.current);
  }, [turnStartedAt, timerSecs, isMyTurn]);

  const circumference = 2 * Math.PI * 20;

  return (
    <div className="flex items-center gap-2">
      <svg width="48" height="48" viewBox="0 0 48 48">
        {/* track */}
        <circle cx="24" cy="24" r="20" fill="none" stroke="var(--border)" strokeWidth="3" />
        {/* progress */}
        <motion.circle
          cx="24" cy="24" r="20"
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{
            strokeDashoffset: useTransform(progress, (p) => circumference * (1 - p)),
            stroke: color,
            rotate: -90,
            transformOrigin: "center",
          }}
        />
        {/* label */}
        <motion.text
          x="24" y="28"
          textAnchor="middle"
          fontSize="11"
          fontFamily="'Share Tech Mono', monospace"
          style={{ fill: color }}
        >
          <motion.tspan>
            {useTransform(progress, (p) => Math.ceil(p * timerSecs))}
          </motion.tspan>
        </motion.text>
      </svg>
    </div>
  );
}