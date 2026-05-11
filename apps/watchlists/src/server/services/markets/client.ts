import { config as defaultConfig, type Config } from "../../../../config-server";

import { MorphoApiError, type MorphoGraphqlError } from "./errors";

type MorphoGraphqlResponse<TData> = {
  data?: TData;
  errors?: MorphoGraphqlError[];
};

export type RequestMorphoGraphqlOptions = {
  config?: Pick<Config, "MORPHO_API_URL">;
  fetchFn?: typeof fetch;
};

export async function requestMorphoGraphql<
  TData,
  TVariables extends Record<string, unknown> = Record<string, never>,
>(
  query: string,
  variables?: TVariables,
  options: RequestMorphoGraphqlOptions = {},
): Promise<TData> {
  const fetchFn = options.fetchFn ?? fetch;
  const response = await fetchFn(
    options.config?.MORPHO_API_URL ?? defaultConfig.MORPHO_API_URL,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    },
  );

  const responseText = await response.text();
  const body = parseMorphoResponse<TData>(responseText);

  if (!response.ok) {
    throw new MorphoApiError(
      `Morpho API request failed with status ${response.status}.`,
      {
        status: response.status,
        graphqlErrors: body?.errors,
      },
    );
  }

  if (body?.errors?.length) {
    throw new MorphoApiError(getGraphqlErrorMessage(body.errors), {
      status: response.status,
      graphqlErrors: body.errors,
    });
  }

  if (!body || !("data" in body)) {
    throw new MorphoApiError("Morpho API response did not include data.", {
      status: response.status,
    });
  }

  return body.data as TData;
}

function parseMorphoResponse<TData>(
  responseText: string,
): MorphoGraphqlResponse<TData> | null {
  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText) as MorphoGraphqlResponse<TData>;
  } catch (error) {
    throw new MorphoApiError("Morpho API returned invalid JSON.", {
      cause: error,
    });
  }
}

function getGraphqlErrorMessage(errors: MorphoGraphqlError[]): string {
  const firstMessage = errors.find((error) => error.message)?.message;

  return firstMessage
    ? `Morpho API GraphQL error: ${firstMessage}`
    : "Morpho API returned GraphQL errors.";
}
