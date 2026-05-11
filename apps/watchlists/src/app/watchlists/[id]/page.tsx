import { WatchlistDetailClient } from "@/features/watchlists/watchlist-detail-client";

export default async function WatchlistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <WatchlistDetailClient watchlistId={id} />;
}
