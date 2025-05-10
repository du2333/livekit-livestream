"use client";

import { listRooms } from "@/app/actions";
import { type ActiveStreamInfo } from "@/lib/controller";
import { Box } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { Spinner } from "./spinner";
import { StreamCard } from "./stream-card";

export function ActiveStreamsList() {
  const [streams, setStreams] = useState<ActiveStreamInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void listRooms().then((streams) => {
      setStreams(streams);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner />
      </div>
    );
  }

  if (streams.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <h1 className="text-center text-5xl font-bold">没人</h1>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
      {streams.map((stream) => (
        <Box key={stream.roomName} className="h-full">
          <StreamCard stream={stream} />
        </Box>
      ))}
    </div>
  );
}
