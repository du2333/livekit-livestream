import { Controller } from "@/lib/controller";
import { Box, Grid, Text } from "@radix-ui/themes";
import { StreamCard } from "./stream-card";

export async function ActiveStreamsList() {
  const controller = new Controller();
  const streams = await controller.listActiveStreams();

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
