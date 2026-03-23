export default function manifest() {
  return {
    name:             "GRIDLOCK — Online Game Arena",
    short_name:       "GRIDLOCK",
    description:      "Real-time multiplayer gaming arena. Challenge friends, climb the leaderboard and dominate the grid. Play Tic-Tac-Toe and more — no downloads needed.",
    start_url:        "/",
    scope:            "/",
    display:          "standalone",
    orientation:      "portrait-primary",
    background_color: "#060e08",
    theme_color:      "#00e676",
    lang:             "en",
    dir:              "ltr",
    categories:       ["games", "entertainment"],
    icons: [
      {
        src:     "/web-app-manifest-192x192.png",
        sizes:   "192x192",
        type:    "image/png",
        purpose: "any maskable",
      },
      {
        src:     "/web-app-manifest-512x512.png",
        sizes:   "512x512",
        type:    "image/png",
        purpose: "any maskable",
      },
    ],
    shortcuts: [
      {
        name:        "Play Now",
        short_name:  "Play",
        description: "Jump straight into a game",
        url:         "/dashboard",
        icons: [{ src: "/web-app-manifest-192x192.png", sizes: "192x192" }],
      },
      {
        name:        "Leaderboard",
        short_name:  "Rankings",
        description: "See the top players",
        url:         "/leaderboard",
        icons: [{ src: "/web-app-manifest-192x192.png", sizes: "192x192" }],
      },
    ],
    screenshots: [
      {
        src:         "/desktop.png",
        sizes:       "1280x800",
        type:        "image/png",
        form_factor: "wide",
        label:       "GRIDLOCK Dashboard",
      },
      {
        src:         "/mobile.png",
        sizes:       "390x844",
        type:        "image/png",
        form_factor: "narrow",
        label:       "GRIDLOCK on mobile",
      },
    ],
    prefer_related_applications: false,
  };
}