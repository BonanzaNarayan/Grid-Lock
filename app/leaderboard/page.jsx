import { Navbar }             from "@/components/landing/Navbar";
import { Footer }             from "@/components/landing/Footer";
import { AuthModal }          from "@/components/landing/AuthModal";
import { PublicLeaderboard }  from "@/components/leaderboard/PublicLeaderboard";
import { ScanlinesBg }        from "@/components/ui/ScanlinesBg";

export const metadata = {
  title:       "Leaderboard",
  description: "Live rankings of the best GRIDLOCK players. See who's dominating the arena across all game types.",
  openGraph: {
    title:       "GRIDLOCK Leaderboard — Top Players",
    description: "Live rankings of the best GRIDLOCK players. See who's dominating the arena.",
    images:      ["/og-image.png"],
  },
};

export default function LeaderboardPage() {
  return (
    <ScanlinesBg>
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 md:px-8 pt-28 pb-16 flex flex-col gap-8">

        {/* heading */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-primary border border-primary/30 bg-primary/10 px-3 py-1 rounded-sm">
              Live Rankings
            </span>
          </div>
          <h1 className="font-heading text-4xl md:text-6xl font-black text-foreground tracking-tight leading-none">
            LEADER<span className="text-primary">BOARD</span>
          </h1>
          <p className="font-sans text-muted-foreground max-w-lg">
            The best players across all game types. Rankings update in real time.
            Can you make it to the top?
          </p>
        </div>

        {/* leaderboard */}
        <PublicLeaderboard />
      </main>

      <Footer />
      <AuthModal />
    </ScanlinesBg>
  );
}