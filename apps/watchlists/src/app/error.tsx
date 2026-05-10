"use client";

import { Button } from "@pk-task/ui/components/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="bg-card space-y-4 rounded-lg border p-6">
      <div>
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          {error.message || "The app shell could not render this view."}
        </p>
      </div>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
