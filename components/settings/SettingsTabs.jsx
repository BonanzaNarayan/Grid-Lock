"use client";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "profile", label: "Profile"    },
  { id: "account", label: "Account"    },
  { id: "danger",  label: "Danger Zone" },
];

export function SettingsTabs({ active, onChange }) {
  return (
    <div className="flex border-b border-border">
      {TABS.map((tab) => {
        const isActive  = active === tab.id;
        const isDanger  = tab.id === "danger";
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative font-mono text-xs tracking-widest uppercase px-6 py-3 transition-colors duration-150",
              isActive
                ? isDanger ? "text-destructive" : "text-primary"
                : isDanger ? "text-destructive/50 hover:text-destructive" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            {isActive && (
              <motion.span
                layoutId="settings-tab-indicator"
                className={`absolute bottom-0 left-0 right-0 h-px ${isDanger ? "bg-destructive" : "bg-primary"}`}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}