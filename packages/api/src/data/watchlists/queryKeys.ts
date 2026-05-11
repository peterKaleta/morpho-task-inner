export const watchlistsQueryKey = ["watchlists"] as const;

export function watchlistQueryKey(id: string) {
  return ["watchlist", id] as const;
}
