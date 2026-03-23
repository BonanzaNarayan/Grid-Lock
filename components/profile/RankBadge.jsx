import { getRank } from "@/lib/levelService";
import { cn }      from "@/lib/utils";

const sizeMap = {
  sm: { outer: "px-2 py-0.5", icon: "text-sm", text: "text-[10px]" },
  md: { outer: "px-3 py-1",   icon: "text-lg", text: "text-xs"     },
  lg: { outer: "px-4 py-2",   icon: "text-2xl", text: "text-sm"    },
};

export function RankBadge({ level = 0, size = "md" }) {
  const rank  = getRank(level);
  const sizes = sizeMap[size];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border rounded-sm font-mono font-black tracking-widest uppercase",
        "border-current bg-current/10",
        rank.color,
        sizes.outer
      )}
    >
      <span className={sizes.icon}>{rank.icon}</span>
      <span className={sizes.text}>{rank.title}</span>
    </span>
  );
}