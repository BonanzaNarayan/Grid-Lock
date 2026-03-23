"use client";
import { useEffect, useState } from "react";
import { watchPresence } from "@/lib/presenceService";

export function PresenceDot({ uid, className = "" }) {
  const [online, setOnline] = useState(false);

  useEffect(() => {
    if (!uid) return;
    const unsub = watchPresence(uid, (data) => setOnline(data.online));
    return () => unsub();
  }, [uid]);

  return (
    <span
      className={`inline-block w-2 h-2 rounded-full shrink-0 ${
        online ? "bg-primary" : "bg-muted-foreground/40"
      } ${className}`}
      title={online ? "Online" : "Offline"}
    />
  );
}