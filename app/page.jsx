import { ScanlinesBg }   from "@/components/ui/ScanlinesBg";
import { Navbar }        from "@/components/landing/Navbar";
import { Hero }          from "@/components/landing/Hero";
import { GamePreview }   from "@/components/landing/GamePreview";
import { StatsTeaser }   from "@/components/landing/StatsTeaser";
import { Footer }        from "@/components/landing/Footer";
import { AuthModal }     from "@/components/landing/AuthModal";

export default function LandingPage() {
  return (
    <ScanlinesBg>
      <Navbar />
      <main>
        <Hero />
        <GamePreview />
        <StatsTeaser />
      </main>
      <Footer />
      <AuthModal />
    </ScanlinesBg>
  );
}