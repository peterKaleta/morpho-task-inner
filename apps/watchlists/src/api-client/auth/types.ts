export type AuthUser = {
  id: string;
  walletAddress: string;
};

export type AuthMeResponse = {
  user: AuthUser | null;
};

export type AuthNonceResponse = {
  nonce: string;
  message: string;
  expiresAt: string;
};

export type VerifyAuthInput = {
  walletAddress: `0x${string}`;
  nonce: string;
  signature: `0x${string}`;
};

export type VerifyAuthResponse = {
  user: AuthUser;
};
