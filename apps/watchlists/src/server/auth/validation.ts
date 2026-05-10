import { z } from "@pk-task/shared/text-helpers";

export const nonceRequestSchema = z.object({
  walletAddress: z.string().trim().min(1),
});

export const verifyRequestSchema = z.object({
  walletAddress: z.string().trim().min(1),
  nonce: z.string().trim().min(1),
  signature: z.string().trim().min(1),
});

export type NonceRequestInput = z.infer<typeof nonceRequestSchema>;
export type VerifyRequestInput = z.infer<typeof verifyRequestSchema>;
