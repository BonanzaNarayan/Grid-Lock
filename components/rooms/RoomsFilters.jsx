"use client";
import { Search } from "lucide-react";

const GAME_FILTERS = [
  { id: "all",          label: "All Games"    },
  { id: "tic-tac-toe",  label: "Tic-Tac-Toe"  },
  { id: "connect-four",  label: "Connect-Four"  },
];

export function RoomsFilters({ gameType, onGameType, search, onSearch }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* game type filter */}
      <div className="flex bg-background border border-border rounded-sm overflow-hidden shrink-0">
        {GAME_FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => onGameType(f.id)}
            className={`font-mono text-xs tracking-widest uppercase px-4 py-2 transition-colors duration-150
              ${gameType === f.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* room code search */}
      <div className="relative flex-1">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search by room code..."
          className="w-full bg-background border border-border rounded-sm pl-8 pr-4 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors duration-150"
        />
      </div>
    </div>
  );
}