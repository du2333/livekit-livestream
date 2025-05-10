import { ActiveStreamInfo } from "@/lib/controller";
import { Box, Card, Flex, Heading, Text } from "@radix-ui/themes";
import { PersonIcon, VideoIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface StreamCardProps {
  stream: ActiveStreamInfo;
}

export function StreamCard({ stream }: StreamCardProps) {
  // 确保日期是有效的
  const formatDate = () => {
    try {
      return formatDistanceToNow(new Date(stream.creationTime), {
        addSuffix: true,
      });
    } catch (error) {
      return "刚刚创建";
    }
  };

  return (
    <Link
      href={`/watch/${encodeURIComponent(stream.roomName)}`}
      className="block h-full"
    >
      <Card
        className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full"
        style={{
          borderRadius: "12px",
          cursor: "pointer",
        }}
      >
        <Flex direction="column" gap="3" className="h-full">
          {/* 直播缩略图区域 */}
          <Box
            className="relative bg-slate-100 dark:bg-slate-800 flex justify-center items-center w-64"
            style={{
              minHeight: "160px",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <VideoIcon width={40} height={40} className="text-slate-400" />
            <Box className="absolute bottom-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-md">
              LIVE
            </Box>
          </Box>

          {/* 直播信息 */}
          <Flex direction="column" gap="2" className="flex-grow">
            <Heading
              size="3"
              className="line-clamp-2"
              style={{ minHeight: "48px" }}
            >
              {stream.roomName}
            </Heading>

            <Flex justify="between" align="center" direction="column">
              <Flex align="center" gap="1">
                <PersonIcon />
                <Text size="2">
                  {stream.creatorIdentity || "一位不愿意透露姓名的主播"}
                </Text>
              </Flex>
              <Text size="1" className="text-slate-500">
                {stream.participantCount} 观众
              </Text>
            </Flex>

            <Text size="1" className="text-slate-500 mt-auto">
              {formatDate()}
            </Text>
          </Flex>
        </Flex>
      </Card>
    </Link>
  );
}
