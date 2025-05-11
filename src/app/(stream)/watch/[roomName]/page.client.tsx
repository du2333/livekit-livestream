"use client";

import { Chat } from "@/components/chat";
import { ReactionBar } from "@/components/reaction-bar";
import { Spinner } from "@/components/spinner";
import { StreamPlayer } from "@/components/stream-player";
import { TokenContext } from "@/components/token-context";
import { useUserName } from "@/hooks/useUserName";
import { type JoinStreamResponse } from "@/lib/controller";
import { cn } from "@/lib/utils";
import { LiveKitRoom } from "@livekit/components-react";
import { ArrowRightIcon, PersonIcon } from "@radix-ui/react-icons";
import {
  Avatar,
  Button,
  Card,
  Flex,
  Heading,
  Text,
  TextField,
} from "@radix-ui/themes";
import { useState } from "react";

export default function WatchPage({
  roomName,
  serverUrl,
}: {
  roomName: string;
  serverUrl: string;
}) {
  const { name, handleNameChange } = useUserName();
  const [authToken, setAuthToken] = useState("");
  const [roomToken, setRoomToken] = useState("");
  const [loading, setLoading] = useState(false);

  const onJoin = async () => {
    setLoading(true);
    const res = await fetch("/api/join_stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        room_name: roomName,
        identity: name,
      }),
    });
    const {
      auth_token,
      connection_details: { token },
    } = (await res.json()) as JoinStreamResponse;

    setAuthToken(auth_token);
    setRoomToken(token);
  };

  if (!authToken || !roomToken) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-3 w-[380px]">
          <Heading size="4" className="mb-4">
            Entering {decodeURI(roomName)}
          </Heading>
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Your name
            </Text>
            <TextField.Root>
              <TextField.Slot>
                <Avatar
                  size="1"
                  radius="full"
                  fallback={name ? name[0] : <PersonIcon />}
                />
              </TextField.Slot>
              <TextField.Input
                placeholder="你谁"
                type="text"
                value={name}
                onChange={handleNameChange}
              />
            </TextField.Root>
          </label>
          <div className="flex gap-3 mt-6 justify-end">
            <Button disabled={!name || loading} onClick={() => void onJoin()}>
              {loading ? (
                <Flex gap="2" align="center">
                  <Spinner />
                  <Text>Joining...</Text>
                </Flex>
              ) : (
                <>
                  Join as viewer{" "}
                  <ArrowRightIcon className={cn(name && "animate-wiggle")} />
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <TokenContext.Provider value={authToken}>
      <LiveKitRoom serverUrl={serverUrl} token={roomToken}>
        <div className="w-full h-screen flex flex-col md:flex-row">
          <div className="flex-1 flex flex-col h-[60vh] md:h-auto">
            <div className="relative flex-1 bg-gray-1">
              <StreamPlayer />
            </div>
            <ReactionBar />
          </div>
          <div className="bg-accent-2 md:min-w-[280px] md:max-w-[350px] md:w-1/4 border-l border-accent-5 h-[40vh] md:h-screen overflow-y-auto">
            <Chat />
          </div>
        </div>
      </LiveKitRoom>
    </TokenContext.Provider>
  );
}
