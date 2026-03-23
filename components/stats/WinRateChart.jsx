"use client";
import { useEffect, useRef, useState } from "react";
import { motion }           from "motion/react";
import { useAuthStore }     from "@/store/useAuthStore";
import { getWinRateHistory } from "@/lib/statsService";

export function WinRateChart() {
  const { user }   = useAuthStore();
  const canvasRef  = useRef(null);
  const [data,     setData]    = useState([]);
  const [loading,  setLoading] = useState(true);
  const [hovered,  setHovered] = useState(null);
  const [days,     setDays]    = useState(30);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getWinRateHistory(user.uid, days).then((d) => {
      setData(d);
      setLoading(false);
    });
  }, [user, days]);

  useEffect(() => {
    if (!canvasRef.current || !data.length) return;
    const canvas  = canvasRef.current;
    const ctx     = canvas.getContext("2d");
    const W       = canvas.width;
    const H       = canvas.height;
    const pad     = { top: 20, right: 20, bottom: 40, left: 40 };
    const chartW  = W - pad.left - pad.right;
    const chartH  = H - pad.top  - pad.bottom;

    ctx.clearRect(0, 0, W, H);

    const primary = "#00e676";
    const muted   = "#2e6b42";
    const border  = "#1a3d22";

    // grid lines
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (chartH / 4) * i;
      ctx.beginPath();
      ctx.strokeStyle = border;
      ctx.lineWidth   = 0.5;
      ctx.setLineDash([4, 4]);
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + chartW, y);
      ctx.stroke();
      ctx.setLineDash([]);

      // y-axis labels
      ctx.fillStyle  = muted;
      ctx.font       = "10px 'Share Tech Mono'";
      ctx.textAlign  = "right";
      ctx.fillText(`${100 - i * 25}%`, pad.left - 6, y + 4);
    }

    if (data.length < 2) {
      ctx.fillStyle = muted;
      ctx.font      = "11px 'Share Tech Mono'";
      ctx.textAlign = "center";
      ctx.fillText("Not enough data yet", W / 2, H / 2);
      return;
    }

    const xStep  = chartW / (data.length - 1);
    const points = data.map((d, i) => ({
      x: pad.left + i * xStep,
      y: pad.top  + chartH * (1 - d.rate / 100),
      ...d,
    }));

    // fill area
    const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
    grad.addColorStop(0,   "rgba(0,230,118,0.15)");
    grad.addColorStop(1,   "rgba(0,230,118,0)");
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, pad.top + chartH);
    ctx.lineTo(points[0].x, pad.top + chartH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // line
    ctx.beginPath();
    ctx.strokeStyle = primary;
    ctx.lineWidth   = 2;
    ctx.lineJoin    = "round";
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.stroke();

    // dots
    points.forEach((p, i) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, hovered === i ? 5 : 3, 0, Math.PI * 2);
      ctx.fillStyle   = hovered === i ? "#fff" : primary;
      ctx.strokeStyle = primary;
      ctx.lineWidth   = 2;
      ctx.fill();
      ctx.stroke();
    });

    // x-axis labels — show max 6
    const step = Math.ceil(data.length / 6);
    points.forEach((p, i) => {
      if (i % step !== 0 && i !== data.length - 1) return;
      ctx.fillStyle  = muted;
      ctx.font       = "9px 'Share Tech Mono'";
      ctx.textAlign  = "center";
      ctx.fillText(p.day, p.x, pad.top + chartH + 16);
    });

    // hovered tooltip
    if (hovered !== null && points[hovered]) {
      const p = points[hovered];
      ctx.beginPath();
      ctx.strokeStyle = primary;
      ctx.lineWidth   = 0.5;
      ctx.setLineDash([3, 3]);
      ctx.moveTo(p.x, pad.top);
      ctx.lineTo(p.x, pad.top + chartH);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [data, hovered]);

  function handleMouseMove(e) {
    if (!canvasRef.current || !data.length) return;
    const rect   = canvasRef.current.getBoundingClientRect();
    const x      = e.clientX - rect.left;
    const pad    = { left: 40, right: 20 };
    const chartW = canvasRef.current.width - pad.left - pad.right;
    const xStep  = chartW / Math.max(data.length - 1, 1);
    const idx    = Math.round((x - pad.left) / xStep);
    setHovered(idx >= 0 && idx < data.length ? idx : null);
  }

  const RANGES = [
    { id: 7,  label: "7D"  },
    { id: 30, label: "30D" },
    { id: 90, label: "90D" },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-xs font-black tracking-widest text-foreground">
          WIN RATE OVER TIME
        </h3>
        <div className="flex bg-background border border-border rounded-sm overflow-hidden">
          {RANGES.map((r) => (
            <button
              key={r.id}
              onClick={() => setDays(r.id)}
              className={`font-mono text-[10px] tracking-widest px-3 py-1.5 transition-colors duration-150
                ${days === r.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* tooltip */}
      <div className="h-5">
        {hovered !== null && data[hovered] && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-mono text-xs text-primary"
          >
            {data[hovered].day} — {data[hovered].rate}% win rate
            ({data[hovered].wins}W / {data[hovered].total} games)
          </motion.p>
        )}
      </div>

      {loading ? (
        <div className="h-48 bg-background border border-border rounded-sm flex items-center justify-center">
          <p className="font-mono text-xs text-muted-foreground tracking-widest animate-pulse">
            LOADING...
          </p>
        </div>
      ) : (
        <div className="relative bg-background border border-border rounded-sm overflow-hidden">
          <canvas
            ref={canvasRef}
            width={600}
            height={200}
            className="w-full h-48"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHovered(null)}
          />
        </div>
      )}
    </div>
  );
}