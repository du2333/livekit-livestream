"use client";

import { type RoomMetadata } from "@/lib/controller";
import {
  type ReceivedChatMessage,
  useChat,
  useLocalParticipant,
  useRoomInfo,
} from "@livekit/components-react";
import { PaperPlaneIcon, PersonIcon } from "@radix-ui/react-icons";
import {
  Avatar,
  Box,
  Flex,
  IconButton,
  Text,
  TextField,
} from "@radix-ui/themes";
import { useEffect, useMemo, useRef, useState } from "react";

function ChatMessage({ message }: { message: ReceivedChatMessage }) {
  const { localParticipant } = useLocalParticipant();

  return (
    <Flex gap="2" align="start" className="break-words w-full">
      <Avatar
        size="1"
        fallback={message.from?.identity[0] ?? <PersonIcon />}
        radius="full"
        className="shrink-0"
      />
      <Flex direction="column" className="min-w-0 flex-1">
        <Text
          weight="bold"
          size="1"
          className={
            localParticipant.identity === message.from?.identity
              ? "text-accent-11"
              : "text-gray-11"
          }
        >
          {message.from?.identity ?? "Unknown"}
        </Text>
        <Text size="1" className="break-words whitespace-pre-wrap">
          {message.message}
        </Text>
      </Flex>
    </Flex>
  );
}

export function Chat() {
  const [draft, setDraft] = useState("");
  const { chatMessages, send } = useChat();
  const { metadata } = useRoomInfo();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { enable_chat: chatEnabled } = (
    metadata ? JSON.parse(metadata) : {}
  ) as RoomMetadata;

  // HACK: why do we get duplicate messages?
  const messages = useMemo(() => {
    const timestamps = chatMessages.map((msg) => msg.timestamp);
    const filtered = chatMessages.filter(
      (msg, i) => !timestamps.includes(msg.timestamp, i + 1)
    );

    return filtered;
  }, [chatMessages]);

  // 自动滚动到最新消息
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const onSend = async () => {
    if (draft.trim().length && send) {
      setDraft("");
      await send(draft);
    }
  };

  return (
    <Flex direction="column" className="h-full">
      {/* 标题区域 */}
      <Box className="text-center p-2 border-b border-accent-5 shrink-0">
        <Text size="2" className="font-mono text-accent-11">
          Live Chat
        </Text>
      </Box>

      {/* 消息区域 */}
      <Flex
        direction="column"
        className="flex-1 overflow-y-auto px-2 py-2 gap-3 scroll-smooth"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(155, 155, 155, 0.5) transparent",
        }}
      >
        {messages.length > 0 ? (
          messages.map((msg) => (
            <ChatMessage message={msg} key={msg.timestamp} />
          ))
        ) : (
          <Text size="1" className="text-center text-gray-11 italic mt-4">
            No messages yet
          </Text>
        )}
        <div ref={messagesEndRef} />
      </Flex>

      {/* 输入区域 */}
      <Box className="mt-auto shrink-0 border-t border-accent-5">
        <Flex gap="2" py="3" px="3" className="items-end">
          <Box className="flex-1">
            <TextField.Input
              disabled={!chatEnabled}
              placeholder={
                chatEnabled ? "Say something..." : "Chat is disabled"
              }
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void onSend();
                }
              }}
            />
          </Box>
          <IconButton
            onClick={() => void onSend()}
            disabled={!draft.trim().length || !chatEnabled}
            className="shrink-0"
          >
            <PaperPlaneIcon />
          </IconButton>
        </Flex>
      </Box>
    </Flex>
  );
}
