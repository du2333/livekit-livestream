import "@/styles/globals.css";

import { Theme } from "@radix-ui/themes";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "后村大舞台",
    template: "%s | 后村大舞台",
  },
  description: "后村大舞台，有才你就来",
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
