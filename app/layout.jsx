import { ChallengeNotifications } from "@/components/social/ChallengeNotifications";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

// ─── Core config ────────────────────────────────────────────────
const siteUrl         = "https://grid-lock-sandy.vercel.app"; // replace with your domain
const siteName        = "GRIDLOCK";
const siteDescription =
  "Real-time multiplayer gaming arena. Challenge friends, climb the leaderboard and dominate the grid. Play Tic-Tac-Toe and more — no downloads needed.";
const siteImage       = "/og-image.png"; // 1200×630px — create this in /public

// ─── Viewport ───────────────────────────────────────────────────
export const viewport = {
  width:        "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit:  "cover",
  themeColor:   "#00e676",
  interactiveWidget: "resizes-content",
};

// ─── Metadata ───────────────────────────────────────────────────
export const metadata = {
  metadataBase: new URL(siteUrl),

  // ── Title ──
  title: {
    default:  `${siteName} — Online Game Arena`,
    template: `%s — ${siteName}`,
  },

  // ── Description ──
  description: siteDescription,

  // ── Keywords ──
  keywords: [
    "multiplayer games",
    "online games",
    "tic tac toe online",
    "real-time gaming",
    "browser games",
    "play with friends",
    "gridlock",
    "game arena",
    "online multiplayer",
    "free browser games",
    "play tic tac toe",
    "real time multiplayer",
  ],

  // ── Canonical ──
  alternates: {
    canonical: siteUrl,
  },

  // ── Authors ──
  authors:   [{ name: siteName, url: siteUrl }],
  creator:   siteName,
  publisher: siteName,

  // ── Open Graph ──
  openGraph: {
    type:        "website",
    locale:      "en_US",
    url:         siteUrl,
    siteName,
    title:       `${siteName} — Online Game Arena`,
    description: siteDescription,
    images: [
      {
        url:    siteImage,
        width:  1200,
        height: 630,
        alt:    `${siteName} — Online Game Arena`,
      },
    ],
  },

  // ── Twitter / X ──
  twitter: {
    card:        "summary_large_image",
    title:       `${siteName} — Online Game Arena`,
    description: siteDescription,
    images:      [siteImage],
    // creator: "@gridlockgg", // uncomment when you have an X handle
  },

  // ── Robots ──
  robots: {
    index:  true,
    follow: true,
    googleBot: {
      index:               true,
      follow:              true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet":       -1,
    },
  },
};

// ─── JSON-LD structured data ─────────────────────────────────────
const jsonLd = {
  "@context": "https://schema.org",
  "@type":    "WebApplication",
  name:        siteName,
  url:         siteUrl,
  description: siteDescription,
  applicationCategory: "GameApplication",
  operatingSystem:     "Web",
  browserRequirements: "Requires JavaScript",
  offers: {
    "@type":         "Offer",
    price:           "0",
    priceCurrency:   "USD",
    availability:    "https://schema.org/InStock",
  },
  creator: {
    "@type": "Organization",
    name:    siteName,
    url:     siteUrl,
  },
  featureList: [
    "Real-time multiplayer",
    "Tic-Tac-Toe",
    "Live leaderboard",
    "Friend system",
    "In-game chat",
    "Best of 3 / Best of 5 modes",
  ],
};

// ─── Layout ──────────────────────────────────────────────────────
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* PWA iOS meta tags */}
        <meta name="mobile-web-app-capable"              content="yes" />
        <meta name="apple-mobile-web-app-capable"        content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title"          content={siteName} />
        <meta name="application-name"                    content={siteName} />
        <meta name="msapplication-TileColor"             content="#060e08" />
        <meta name="msapplication-TileImage"             content="/web-app-manifest-192x192.png" />

        {/* Google Fonts preconnect */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AuthProvider>
          {children}
          <ChallengeNotifications />
        </AuthProvider>
      </body>
    </html>
  );
}