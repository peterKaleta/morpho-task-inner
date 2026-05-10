import type { Metadata } from "next";
import { AppQueryClientProvider } from "@/providers/query-client-provider";
import { SessionProvider } from "@/providers/session-provider";
import { Shell } from "@/shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Morpho Market Watchlists",
  description: "Organize and monitor Morpho markets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>
        <AppQueryClientProvider>
          <SessionProvider>
            <Shell>{children}</Shell>
          </SessionProvider>
        </AppQueryClientProvider>
      </body>
    </html>
  );
}
