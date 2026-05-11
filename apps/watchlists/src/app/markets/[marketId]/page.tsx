import { MarketDetailClient } from "@/features/markets/market-detail-client";

export default async function MarketDetailPage({
  params,
}: {
  params: Promise<{ marketId: string }>;
}) {
  const { marketId } = await params;

  return <MarketDetailClient marketId={decodeURIComponent(marketId)} />;
}
