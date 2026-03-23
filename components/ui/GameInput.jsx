"use client";
import { motion } from "motion/react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function GameInput({ label, id, error, className, ...props }) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className="font-mono text-xs tracking-widest uppercase text-muted-foreground"
        >
          {label}
        </label>
      )}
      <motion.div
        animate={{
          borderColor: error
            ? "var(--destructive)"
            : focused
            ? "var(--primary)"
            : "var(--border)",
        }}
        transition={{ duration: 0.2 }}
        className="relative border rounded-sm overflow-hidden"
        style={{ borderColor: "var(--border)" }}
      >
        <Input
          id={id}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={cn(
            "border-0 rounded-none bg-card text-text-primary font-sans text-base",
            "px-4 py-3 outline-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0",
            "placeholder:text-muted-foreground",
            className
          )}
          {...props}
        />
        <motion.span
          className="absolute left-0 top-0 w-0.5 bg-primary"
          animate={{ height: focused ? "100%" : "0%" }}
          transition={{ duration: 0.2 }}
        />
      </motion.div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-mono text-xs text-destructive"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}