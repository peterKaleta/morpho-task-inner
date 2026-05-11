export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "Not available";
  }

  return new Intl.NumberFormat("en", {
    style: "percent",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatAssetAmount(
  value: string | null | undefined,
  decimals: number | null | undefined,
  symbol: string | null | undefined,
): string {
  if (!value || decimals === null || decimals === undefined) {
    return "Not available";
  }

  const decimalValue = parseRawTokenAmount(value, decimals);

  if (decimalValue === null) {
    return "Not available";
  }

  const formattedValue = new Intl.NumberFormat("en", {
    maximumFractionDigits: 2,
    notation: "compact",
  }).format(decimalValue);

  return `${formattedValue} ${symbol || "loan asset"}`;
}

export function formatLltv(value: string | null | undefined): string {
  if (!value) {
    return "Not available";
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return value;
  }

  return formatPercent(numericValue > 1 ? numericValue / 1e18 : numericValue);
}

export function formatMarketPair(
  loanSymbol: string | null | undefined,
  collateralSymbol: string | null | undefined,
): string {
  return `${loanSymbol || "Unknown"} / ${collateralSymbol || "Unknown"}`;
}

function parseRawTokenAmount(value: string, decimals: number): number | null {
  const rawAmount = parseRawInteger(value);

  if (rawAmount === null || decimals < 0) {
    return null;
  }

  const scale = 10n ** BigInt(decimals);
  const whole = rawAmount / scale;
  const fraction = rawAmount % scale;
  const precision = 6;
  const trimmedFraction =
    decimals > precision
      ? fraction / 10n ** BigInt(decimals - precision)
      : fraction * 10n ** BigInt(precision - decimals);

  return Number(
    `${whole}.${trimmedFraction.toString().padStart(precision, "0")}`,
  );
}

function parseRawInteger(value: string): bigint | null {
  const trimmedValue = value.trim();

  if (/^\d+$/.test(trimmedValue)) {
    return BigInt(trimmedValue);
  }

  const scientificMatch = trimmedValue.match(/^(\d+)(?:\.(\d+))?e\+(\d+)$/i);

  if (!scientificMatch) {
    return null;
  }

  const [, whole, fraction = "", exponent] = scientificMatch;
  const digits = `${whole}${fraction}`;
  const zeroCount = Number(exponent) - fraction.length;

  if (zeroCount < 0 || !Number.isSafeInteger(zeroCount)) {
    return null;
  }

  return BigInt(`${digits}${"0".repeat(zeroCount)}`);
}
