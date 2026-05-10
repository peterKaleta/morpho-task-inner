import Link from "next/link";
import { Button } from "@pk-task/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@pk-task/ui/components/card";

export default async function WatchlistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link href="/watchlists">Back to watchlists</Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Watchlist detail</CardTitle>
          <CardDescription>{id}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Saved market comparison table will be wired after auth, data, and
            GraphQL.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
