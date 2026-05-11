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
