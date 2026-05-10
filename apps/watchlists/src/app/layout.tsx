import type { Metadata } from "next";
import Link from "next/link";
import { Wallet } from "lucide-react";
import { Button } from "@pk-task/ui/components/button";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Morpho Market Watchlists",
  description: "Organize and monitor Morpho markets.",
};

const navItems = [
  { href: "/markets", label: "Markets" },
  { href: "/watchlists", label: "Watchlists" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>
        <Providers>
          <div className="min-h-dvh">
            <header className="bg-card border-b">
              <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
                <Link href="/markets" className="font-semibold">
                  Morpho Market Watchlists
                </Link>
                <nav className="flex items-center gap-2">
                  {navItems.map((item) => (
                    <Button key={item.href} asChild variant="ghost" size="sm">
                      <Link href={item.href}>{item.label}</Link>
                    </Button>
                  ))}
                  <Button variant="outline" size="sm">
                    <Wallet className="size-4" aria-hidden="true" />
                    Connect
                  </Button>
                </nav>
              </div>
            </header>
            <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
