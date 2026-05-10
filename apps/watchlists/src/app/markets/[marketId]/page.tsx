import Link from "next/link";
import { BookmarkPlus } from "lucide-react";
import { Button } from "@pk-task/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@pk-task/ui/components/card";

export default async function MarketDetailPage({
  params,
}: {
  params: Promise<{ marketId: string }>;
}) {
  const { marketId } = await params;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link href="/markets">Back to markets</Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Market detail</CardTitle>
          <CardDescription>{marketId}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Metric label="Supply APY" value="Pending API" />
            <Metric label="Borrow APY" value="Pending API" />
            <Metric label="Liquidity" value="Pending API" />
          </div>
          <Button>
            <BookmarkPlus className="size-4" aria-hidden="true" />
            Add to watchlist
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background rounded-md border p-4">
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}
