export type MarketAsset = {
  address: string | null;
  symbol: string | null;
  decimals: number | null;
};

export type MarketChain = {
  id: number | null;
  network: string | null;
};

export type MarketState = {
  supplyApy: number | null;
  borrowApy: number | null;
  totalLiquidity: string | null;
  totalMarketSize: string | null;
};

export type Market = {
  marketId: string;
  chain: MarketChain | null;
  loanAsset: MarketAsset | null;
  collateralAsset: MarketAsset | null;
  lltv: string | null;
  state: MarketState | null;
};

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
  marketUniqueKey: string;
  market: Market | null;
  createdAt: string;
};

export type Watchlist = {
  id: string;
  name: string;
  description: string | null;
  items: WatchlistItem[];
  createdAt: string;
  updatedAt: string;
};

export type WatchlistFormInput = {
  name: string;
  description?: string | null;
};

export type CreateWatchlistInput = WatchlistFormInput;

export type UpdateWatchlistInput = WatchlistFormInput & {
  id: string;
};

export type AddMarketToWatchlistInput = {
  watchlistId: string;
  marketUniqueKey: string;
};

export type RemoveMarketFromWatchlistInput = AddMarketToWatchlistInput;
