import Link from "next/link";

import { Button } from "@pk-task/ui/components/button";

import { AuthButtons } from "@/features/auth/auth-buttons";

const navItems = [
  { href: "/markets", label: "Markets" },
  { href: "/watchlists", label: "Watchlists" },
];

export function Shell({ children }: { children: React.ReactNode }) {
  return (
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
            <AuthButtons />
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
