import { ActiveStreamsList } from "@/components/active-streams-list";
import { HomeActions } from "@/components/home-actions";
import { Separator } from "@/components/ui/separator";
import { Container, Flex, Heading, Text } from "@radix-ui/themes";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center gap-12 p-10 sm:p-24">
      <Container size="3">
        <Flex direction="column" align="center" gap="8">
          <Image
            src="/wordmark.svg"
            alt="LiveKit"
            width="240"
            height="120"
            className="mt-8 mb-2"
          />

          <div className="w-full max-w-screen-lg">
            <Flex direction="column" gap="8">
              <div className="flex flex-col items-center gap-2">
                <HomeActions />
              </div>
              <Separator className="w-full" />
              <div className="flex flex-col items-center gap-2">
                <Heading size="6" align="center" className="mb-2">
                  直播广场
                </Heading>
                <Text align="center" className="text-slate-500 mb-8">
                  发现正在进行的实时直播，或开始您自己的直播
                </Text>
              </div>

              <ActiveStreamsList />
            </Flex>
          </div>
        </Flex>
      </Container>
    </main>
  );
}
