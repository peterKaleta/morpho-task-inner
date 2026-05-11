import type { ReactNode } from "react";

export function WatchlistState({
  action,
  description,
  title,
}: {
  action?: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-md border border-dashed p-6 text-center">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-muted-foreground mt-1 text-sm">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function WatchlistSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="bg-muted h-24 animate-pulse rounded-md"
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
