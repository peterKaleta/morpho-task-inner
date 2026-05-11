export type MorphoAssetFields = {
  address: string | null;
  symbol: string | null;
  decimals: number | null;
};

export type MorphoChainFields = {
  id: number | null;
  network: string | null;
};

export type MorphoMarketStateFields = {
  borrowApy: number | null;
  supplyApy: number | null;
  totalLiquidity: string | null;
  totalMarketSize: string | null;
};

export type MorphoMarketFields = {
  marketId: string;
  uniqueKey?: string | null;
  chain: MorphoChainFields | null;
  loanAsset: MorphoAssetFields | null;
  collateralAsset: MorphoAssetFields | null;
  lltv: string | null;
  state: MorphoMarketStateFields | null;
};
