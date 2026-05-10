import { z } from "zod";

export { z };

export type EnvSource = Record<string, string | undefined>;

export const nonEmptyString = z.string().trim().min(1);

export const optionalString = z.preprocess(
  emptyStringToUndefined,
  z.string().trim().optional(),
);

export const urlString = z.string().trim().url();

export const optionalUrlString = z.preprocess(
  emptyStringToUndefined,
  z.string().trim().url().optional(),
);

export function emptyStringToUndefined(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : undefined;
}
