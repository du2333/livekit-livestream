"use client";

import { BroadcastDialog } from "@/components/broadcast-dialog";
import { IngressDialog } from "@/components/ingress-dialog";
import { JoinDialog } from "@/components/join-dialog";
import { Button, Text } from "@radix-ui/themes";

export function HomeActions() {
  return (
    <div className="flex flex-col gap-4 justify-center items-center">
      <div className="flex gap-2">
        <BroadcastDialog>
          <Button size="3" className="hidden md:block">
            <span className="hidden sm:block">Stream from browser</span>
            <span className="block sm:hidden">Browser</span>
          </Button>
        </BroadcastDialog>
        <IngressDialog>
          <Button size="3" className="hidden md:block">
            <span className="hidden sm:block">Stream from OBS</span>
            <span className="block sm:hidden">OBS</span>
          </Button>
        </IngressDialog>
      </div>
      <Text size="1">- OR -</Text>
      <JoinDialog>
        <Button variant="outline" size="3" className="w-full">
          Join existing stream
        </Button>
      </JoinDialog>
    </div>
  );
}
