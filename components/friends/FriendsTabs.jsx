"use client";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "find",     label: "Find Friends" },
  { id: "friends",  label: "Friends"      },
  { id: "requests", label: "Requests"     },
];

export function FriendsTabs({ active, onChange, requestCount = 0 }) {
  return (
    <div className="flex border-b border-border">
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative font-mono text-xs tracking-widest uppercase px-6 py-3 transition-colors duration-150 flex items-center gap-2",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            {tab.id === "requests" && requestCount > 0 && (
              <span className="font-mono text-[9px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-sm">
                {requestCount}
              </span>
            )}
            {isActive && (
              <motion.span
                layoutId="friends-tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-px bg-primary"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}