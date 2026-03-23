'use client'
import { RoomShell } from "@/components/room/RoomShell";
import { useParams } from "next/navigation";

export default function RoomPage() {
  const params = useParams()
  const id = params.roomId
  return <RoomShell roomId={id} />;
}