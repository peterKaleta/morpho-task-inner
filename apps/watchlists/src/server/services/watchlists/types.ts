import type { MarketDetail } from "@/server/services/markets/types";

export type WatchlistSummary = {
  id: string;
  name: string;
  description: string | null;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
};

export type WatchlistItem = {
  id: string;
  watchlistId: string;
  marketUniqueKey: string;
  market?: MarketDetail | null;
  createdAt: string;
};

export type WatchlistDetail = {
  id: string;
  name: string;
  description: string | null;
  items: WatchlistItem[];
  createdAt: string;
  updatedAt: string;
};
