import { ActiveStreamInfo } from "@/lib/controller";
import { Box, Card, Flex, Heading, Text } from "@radix-ui/themes";
import { PersonIcon, VideoIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface StreamCardProps {
  stream: ActiveStreamInfo;
}

export function StreamCard({ stream }: StreamCardProps) {
  // 格式化日期，解决时间显示问题
  const formatDate = () => {
    try {
      // 确保时间戳是正确的（毫秒级）
      let timestamp = stream.creationTime;

      // 检查时间戳是否需要转换为毫秒
      if (String(timestamp).length <= 10) {
        timestamp = timestamp * 1000;
      }

      // 检查时间是否在合理范围内
      const date = new Date(timestamp);
      const now = new Date();
      const isValid = date <= now && date.getFullYear() > 2000;

      if (!isValid) {
        return "刚刚创建";
      }

      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error("日期格式化错误:", error, stream.creationTime);
      return "刚刚创建";
    }
  };

  return (
    <Link
      href={`/watch/${encodeURIComponent(stream.roomName)}`}
      className="block w-full h-full"
    >
      <Card
        className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full w-full"
        style={{
          borderRadius: "16px",
          cursor: "pointer",
          minWidth: "280px",
        }}
      >
        {/* 直播缩略图区域 - 更大的区域 */}
        <div className="p-0 w-full">
          <div className="relative bg-slate-100 dark:bg-slate-800 rounded-t-lg overflow-hidden flex justify-center items-center w-full aspect-video">
            {/* 可选：使用用户头像作为直播占位图 */}
            {stream.creatorIdentity ? (
              <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-slate-700/20 to-slate-900/50 flex items-center justify-center">
                <VideoIcon width={60} height={60} className="text-slate-300" />
              </div>
            ) : (
              <VideoIcon width={60} height={60} className="text-slate-400" />
            )}
            <div className="absolute bottom-3 right-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-md">
              LIVE
            </div>
          </div>
        </div>

        {/* 直播信息 */}
        <Flex direction="column" gap="3" className="flex-grow p-4">
          <Heading
            size="3"
            className="line-clamp-2 text-left"
            style={{ minHeight: "48px" }}
          >
            {stream.roomName}
          </Heading>

          <Flex direction="column" gap="2">
            {/* 主播信息 */}
            <Flex align="center" gap="2">
              <PersonIcon className="text-slate-500 w-5 h-5" />
              <Text
                size="2"
                className="text-slate-700 dark:text-slate-200 font-medium truncate"
              >
                {stream.creatorIdentity || "一位不愿意透露姓名的主播"}
              </Text>
            </Flex>

            {/* 观众人数和时间信息 */}
            <Flex justify="between" align="center" className="mt-1">
              <Text
                size="1"
                className="text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full"
              >
                {stream.participantCount} 观众
              </Text>
              <Text size="1" className="text-slate-500">
                {formatDate()}
              </Text>
            </Flex>
          </Flex>
        </Flex>
      </Card>
    </Link>
  );
}
