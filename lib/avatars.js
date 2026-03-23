export const AVATARS = [
  // ── Gaming ──────────────────────────────
  { id: "controller",   icon: "🎮", label: "Controller",    category: "Gaming"   },
  { id: "sword",        icon: "⚔️",  label: "Sword",         category: "Gaming"   },
  { id: "shield",       icon: "🛡️",  label: "Shield",        category: "Gaming"   },
  { id: "bow",          icon: "🏹",  label: "Archer",        category: "Gaming"   },
  { id: "chess-king",   icon: "♚",  label: "Chess King",    category: "Gaming"   },
  { id: "chess-knight", icon: "♞",  label: "Chess Knight",  category: "Gaming"   },
  { id: "dice",         icon: "🎲",  label: "Dice",          category: "Gaming"   },
  { id: "trophy",       icon: "🏆",  label: "Trophy",        category: "Gaming"   },
  { id: "target",       icon: "🎯",  label: "Target",        category: "Gaming"   },
  { id: "joystick",     icon: "🕹️",  label: "Joystick",      category: "Gaming"   },
  { id: "puzzle",       icon: "🧩",  label: "Puzzle",        category: "Gaming"   },
  { id: "cards",        icon: "🃏",  label: "Cards",         category: "Gaming"   },
  { id: "crown",        icon: "👑",  label: "Crown",         category: "Gaming"   },
  { id: "axe",          icon: "🪓",  label: "Axe",           category: "Gaming"   },
  { id: "magic",        icon: "🪄",  label: "Magic Wand",    category: "Gaming"   },
  { id: "gem",          icon: "💎",  label: "Gem",           category: "Gaming"   },
  { id: "bomb",         icon: "💣",  label: "Bomb",          category: "Gaming"   },
  { id: "dagger",       icon: "🗡️",  label: "Dagger",        category: "Gaming"   },

  // ── Sci-fi / Cyberpunk ───────────────────
  { id: "robot",        icon: "🤖",  label: "Robot",         category: "Sci-fi"   },
  { id: "alien",        icon: "👾",  label: "Alien",         category: "Sci-fi"   },
  { id: "ufo",          icon: "🛸",  label: "UFO",           category: "Sci-fi"   },
  { id: "satellite",    icon: "🛰️",  label: "Satellite",     category: "Sci-fi"   },
  { id: "rocket",       icon: "🚀",  label: "Rocket",        category: "Sci-fi"   },
  { id: "atom",         icon: "⚛️",  label: "Atom",          category: "Sci-fi"   },
  { id: "dna",          icon: "🧬",  label: "DNA",           category: "Sci-fi"   },
  { id: "circuit",      icon: "🔌",  label: "Circuit",       category: "Sci-fi"   },
  { id: "laser",        icon: "🔫",  label: "Laser",         category: "Sci-fi"   },
  { id: "cyber-eye",    icon: "👁️",  label: "Cyber Eye",     category: "Sci-fi"   },
  { id: "satellite2",   icon: "📡",  label: "Antenna",       category: "Sci-fi"   },
  { id: "magnet",       icon: "🧲",  label: "Magnet",        category: "Sci-fi"   },
  { id: "vortex",       icon: "🌀",  label: "Vortex",        category: "Sci-fi"   },
  { id: "comet",        icon: "☄️",  label: "Comet",         category: "Sci-fi"   },
  { id: "blackhole",    icon: "🕳️",  label: "Black Hole",    category: "Sci-fi"   },
  { id: "biohazard",    icon: "☣️",  label: "Biohazard",     category: "Sci-fi"   },
  { id: "radioactive",  icon: "☢️",  label: "Radioactive",   category: "Sci-fi"   },

  // ── Animals / Creatures ──────────────────
  { id: "dragon",       icon: "🐉",  label: "Dragon",        category: "Creature" },
  { id: "wolf",         icon: "🐺",  label: "Wolf",          category: "Creature" },
  { id: "lion",         icon: "🦁",  label: "Lion",          category: "Creature" },
  { id: "eagle",        icon: "🦅",  label: "Eagle",         category: "Creature" },
  { id: "shark",        icon: "🦈",  label: "Shark",         category: "Creature" },
  { id: "snake",        icon: "🐍",  label: "Snake",         category: "Creature" },
  { id: "spider",       icon: "🕷️",  label: "Spider",        category: "Creature" },
  { id: "scorpion",     icon: "🦂",  label: "Scorpion",      category: "Creature" },
  { id: "tiger",        icon: "🐯",  label: "Tiger",         category: "Creature" },
  { id: "bear",         icon: "🐻",  label: "Bear",          category: "Creature" },
  { id: "gorilla",      icon: "🦍",  label: "Gorilla",       category: "Creature" },
  { id: "fox",          icon: "🦊",  label: "Fox",           category: "Creature" },
  { id: "owl",          icon: "🦉",  label: "Owl",           category: "Creature" },
  { id: "bat",          icon: "🦇",  label: "Bat",           category: "Creature" },
  { id: "octopus",      icon: "🐙",  label: "Octopus",       category: "Creature" },
  { id: "unicorn",      icon: "🦄",  label: "Unicorn",       category: "Creature" },
  { id: "phoenix",      icon: "🦅",  label: "Phoenix",       category: "Creature" },
  { id: "kraken",       icon: "🐚",  label: "Kraken",        category: "Creature" },
];

export const AVATAR_CATEGORIES = ["All", "Gaming", "Sci-fi", "Creature"];

export function getAvatar(id) {
  return AVATARS.find((a) => a.id === id) ?? AVATARS[0];
}