import { cn } from "@/lib/utils";

const sizes = {
  sm: "w-8 h-8 text-sm",
  md: "w-12 h-12 text-xl",
  lg: "w-16 h-16 text-3xl",
};

export function PlayerBadge({ player, size = "md" }) {
  const isX = player === "X";
  return (
    <div
      className={cn(
        "flex items-center justify-center font-heading font-black rounded-sm border",
        sizes[size],
        isX
          ? "text-player-x border-player-x bg-player-x/10"
          : "text-player-o border-player-o bg-player-o/10"
      )}
    >
      {player}
    </div>
  );
}