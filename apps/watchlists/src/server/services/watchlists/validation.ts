import { z } from "@pk-task/shared/text-helpers";

export const WATCHLIST_NAME_MAX_LENGTH = 80;
export const WATCHLIST_DESCRIPTION_MAX_LENGTH = 280;

const normalizedDescriptionSchema = z
  .string()
  .trim()
  .max(WATCHLIST_DESCRIPTION_MAX_LENGTH)
  .nullish()
  .transform((value) => {
    const normalizedValue = value?.trim();

    return normalizedValue ? normalizedValue : null;
  });

export const createWatchlistInputSchema = z.object({
  name: z.string().trim().min(1).max(WATCHLIST_NAME_MAX_LENGTH),
  description: normalizedDescriptionSchema,
});

export const updateWatchlistInputSchema = createWatchlistInputSchema.extend({
  id: z.string().uuid(),
});

export const addMarketToWatchlistInputSchema = z.object({
  watchlistId: z.string().uuid(),
  marketUniqueKey: z.string().trim().min(1),
});

export const removeMarketFromWatchlistInputSchema =
  addMarketToWatchlistInputSchema;

export type CreateWatchlistInput = z.infer<typeof createWatchlistInputSchema>;
export type UpdateWatchlistInput = z.infer<typeof updateWatchlistInputSchema>;
export type AddMarketToWatchlistInput = z.infer<
  typeof addMarketToWatchlistInputSchema
>;
export type RemoveMarketFromWatchlistInput = z.infer<
  typeof removeMarketFromWatchlistInputSchema
>;
