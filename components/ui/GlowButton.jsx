"use client";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-primary text-primary-foreground border-primary hover:bg-primary-dim",
  ghost:   "bg-transparent text-primary border-border-game hover:border-primary hover:bg-card",
  danger:  "bg-transparent text-destructive border-destructive hover:bg-destructive hover:text-foreground",
  muted:   "bg-card text-muted-foreground border-border-game hover:border-muted-game hover:text-text-primary",
};

export function GlowButton({ children, variant = "primary", className, disabled, onClick, type = "button" }) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.03 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className={cn(
        "relative font-heading text-sm font-bold tracking-widest uppercase",
        "px-6 py-3 border rounded-sm cursor-pointer",
        "transition-colors duration-200",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
    >
      <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-current opacity-60" />
      <span className="absolute top-0 right-0 w-2 h-2 border-t border-r border-current opacity-60" />
      <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-current opacity-60" />
      <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-current opacity-60" />
      {children}
    </motion.button>
  );
}