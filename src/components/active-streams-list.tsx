"use client";

import { listRooms } from "@/app/actions";
import { Box, Text } from "@radix-ui/themes";
import { StreamCard } from "./stream-card";
import { useState } from "react";
import { useEffect } from "react";
import { type ActiveStreamInfo } from "@/lib/controller";
import { Spinner } from "./spinner";

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
      <Box className="py-12 text-center">
        <Text size="4" className="text-slate-500">
          目前没有直播间
        </Text>
        <Text className="text-slate-400 mt-2">
          创建您自己的直播，成为第一个主播！
        </Text>
      </Box>
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
