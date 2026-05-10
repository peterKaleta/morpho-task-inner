import Link from "next/link";
import { Button } from "@pk-task/ui/components/button";

export default function NotFound() {
  return (
    <div className="bg-card space-y-4 rounded-lg border p-6">
      <div>
        <p className="text-muted-foreground text-sm font-medium">404</p>
        <h1 className="mt-2 text-2xl font-semibold">Page not found</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          The requested Morpho watchlist page is not available.
        </p>
      </div>
      <Button asChild>
        <Link href="/markets">Back to markets</Link>
      </Button>
    </div>
  );
}
