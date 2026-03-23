"use client";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { AVATARS, AVATAR_CATEGORIES } from "@/lib/avatars";
import { Check } from "lucide-react";

export function AvatarPicker({ selected, onSelect }) {
  const [category, setCategory] = useState("All");

  const filtered = category === "All"
    ? AVATARS
    : AVATARS.filter((a) => a.category === category);

  return (
    <div className="flex flex-col gap-4">

      {/* category filter */}
      <div className="flex bg-background border border-border rounded-sm overflow-hidden w-fit">
        {AVATAR_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`
              font-mono text-xs tracking-widest uppercase px-4 py-2 transition-colors duration-150
              ${category === cat
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"}
            `}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* grid */}
      <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-2 max-h-64 overflow-y-auto pr-1">
        {filtered.map((avatar) => {
          const isSelected = selected === avatar.id;
          return (
            <motion.button
              key={avatar.id}
              onClick={() => onSelect(avatar.id)}
              whileHover={{ scale: 1.1 }}
              whileTap={{   scale: 0.95 }}
              title={avatar.label}
              className={`
                relative w-10 h-10 flex items-center justify-center rounded-sm border text-xl
                transition-colors duration-150
                ${isSelected
                  ? "border-primary bg-primary/10"
                  : "border-border bg-background hover:border-border-game"}
              `}
            >
              {avatar.icon}
              {isSelected && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center"
                >
                  <Check size={9} className="text-primary-foreground" />
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* selected preview */}
      {selected && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1,  y: 0  }}
          className="flex items-center gap-2"
        >
          <span className="font-mono text-[10px] text-muted-foreground tracking-widest">
            SELECTED:
          </span>
          <span className="text-xl">
            {AVATARS.find((a) => a.id === selected)?.icon}
          </span>
          <span className="font-mono text-xs text-foreground">
            {AVATARS.find((a) => a.id === selected)?.label}
          </span>
        </motion.div>
      )}
    </div>
  );
}