import { redirect } from "next/navigation";
import WatchPageImpl from "./page.client";
import { type Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ roomName: string }>;
}): Promise<Metadata> {
  const { roomName } = await params;
  return {
    title: `直播间 | ${roomName}`,
    description: `直播 - ${roomName}`,
  };
}

export default async function WatchPage({
  params,
}: {
  params: Promise<{ roomName: string }>;
}) {
  const { roomName } = await params;
  if (!roomName) {
    redirect("/");
  }

  const serverUrl = process.env
    .LIVEKIT_WS_URL!.replace("wss://", "https://")
    .replace("ws://", "http://");

  return <WatchPageImpl roomName={roomName} serverUrl={serverUrl} />;
}
