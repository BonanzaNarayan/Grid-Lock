"use client";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function GameCard({ children, className, hover = false, onClick }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? { scale: 1.015, borderColor: "var(--primary)" } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={cn(
        "relative bg-card border border-border rounded-sm p-6",
        "transition-colors duration-200",
        hover && "cursor-pointer",
        className
      )}
    >
      <span className="absolute top-0 left-6 right-6 h-px bg-primary opacity-20" />
      {children}
    </motion.div>
  );
}