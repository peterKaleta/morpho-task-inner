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
  borrowAssetsUsd: number | null;
  supplyApy: number | null;
  supplyAssetsUsd: number | null;
  liquidityAssetsUsd: number | null;
  utilization: number | null;
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
