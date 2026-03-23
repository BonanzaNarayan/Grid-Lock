import { Navbar }        from "@/components/landing/Navbar";
import { Footer }        from "@/components/landing/Footer";
import { AuthModal }     from "@/components/landing/AuthModal";
import { ScanlinesBg }   from "@/components/ui/ScanlinesBg";
import { PublicRooms }   from "@/components/rooms/PublicRooms";

export const metadata = {
  title:       "Live Rooms — GRIDLOCK",
  description: "Browse all live public game rooms on GRIDLOCK. Jump in and play instantly.",
};

export default function PublicRoomsPage() {
  return (
    <ScanlinesBg>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 md:px-8 pt-28 pb-16 flex flex-col gap-8">
        <div>
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-primary border border-primary/30 bg-primary/10 px-3 py-1 rounded-sm">
            Live Now
          </span>
          <h1 className="font-heading text-4xl md:text-6xl font-black text-foreground tracking-tight leading-none mt-3">
            OPEN <span className="text-primary">ROOMS</span>
          </h1>
          <p className="font-sans text-muted-foreground max-w-lg mt-2">
            All public rooms waiting for a player. Sign up to jump in instantly.
          </p>
        </div>
        <PublicRooms />
      </main>
      <Footer />
      <AuthModal />
    </ScanlinesBg>
  );
}