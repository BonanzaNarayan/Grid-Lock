export function ScanlinesBg({ children, className }) {
  return (
    <div
      className={`relative min-h-screen bg-background ${className ?? ""}`}
      style={{
        // fill behind notch with the background color
        backgroundColor: "var(--background)",
      }}
    >
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, var(--primary) 2px, var(--primary) 3px)",
          backgroundSize: "100% 3px",
          // extend behind notch
          top:    "calc(-1 * env(safe-area-inset-top))",
          left:   "calc(-1 * env(safe-area-inset-left))",
          right:  "calc(-1 * env(safe-area-inset-right))",
          bottom: "calc(-1 * env(safe-area-inset-bottom))",
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, color-mix(in srgb, var(--primary) 6%, transparent) 0%, transparent 70%)",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}