import { ActiveStreamsList } from "@/components/active-streams-list";
import { HomeActions } from "@/components/home-actions";
import { Separator } from "@/components/ui/separator";
import { Container, Flex } from "@radix-ui/themes";
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

              <ActiveStreamsList />
            </Flex>
          </div>
        </Flex>
      </Container>
    </main>
  );
}
