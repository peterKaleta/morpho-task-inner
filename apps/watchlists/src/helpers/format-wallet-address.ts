export function formatWalletAddress(walletAddress: string | undefined) {
  if (!walletAddress) {
    return "Wallet";
  }

  return `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
}
