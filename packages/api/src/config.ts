declare const process: {
  env: {
    NEXT_PUBLIC_WATCHLIST_APP_AUTH_API_URL?: string;
    NEXT_PUBLIC_WATCHLIST_APP_GRAPHQL_API_URL?: string;
  };
};

const DEFAULT_AUTH_API_URL = "/api/auth";
const DEFAULT_GRAPHQL_API_URL = "/api/graphql";

const configuredAuthApiUrl =
  process.env.NEXT_PUBLIC_WATCHLIST_APP_AUTH_API_URL?.trim();
const configuredGraphqlApiUrl =
  process.env.NEXT_PUBLIC_WATCHLIST_APP_GRAPHQL_API_URL?.trim();

export const authApiUrl =
  configuredAuthApiUrl && configuredAuthApiUrl.length > 0
    ? configuredAuthApiUrl
    : DEFAULT_AUTH_API_URL;

export const graphqlApiUrl =
  configuredGraphqlApiUrl && configuredGraphqlApiUrl.length > 0
    ? configuredGraphqlApiUrl
    : DEFAULT_GRAPHQL_API_URL;

export function getAuthApiUrl(path: string): string {
  return joinUrl(authApiUrl, path);
}

function joinUrl(baseUrl: string, path: string): string {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
  const normalizedPath = path.replace(/^\/+/, "");

  return `${normalizedBaseUrl}/${normalizedPath}`;
}
