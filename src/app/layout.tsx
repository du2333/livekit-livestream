import "@/styles/globals.css";

import { Theme } from "@radix-ui/themes";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "黑黑黑Livestream",
  description: "A sample full-stack application built with LiveKit",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className}>
        <Theme
          appearance="dark"
          accentColor="purple"
          grayColor="mauve"
          radius="none"
        >
          {children}
        </Theme>
      </body>
    </html>
  );
}
