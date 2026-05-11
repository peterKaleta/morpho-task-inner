import {
  cacheExchange,
  createClient,
  fetchExchange,
  type AnyVariables,
  type Client,
  type TypedDocumentNode,
} from "urql";

let browserClient: Client | null = null;

export function getGraphqlClient(): Client {
  browserClient ??= createClient({
    url: "/api/graphql",
    exchanges: [cacheExchange, fetchExchange],
    fetchOptions: {
      credentials: "same-origin",
    },
  });

  return browserClient;
}

export async function requestGraphql<TData, TVariables extends AnyVariables>(
  document: TypedDocumentNode<TData, TVariables>,
  variables: TVariables,
): Promise<TData> {
  const result = await getGraphqlClient()
    .query<TData, TVariables>(document, variables, {
      requestPolicy: "network-only",
    })
    .toPromise();

  if (result.error) {
    throw result.error;
  }

  if (!result.data) {
    throw new Error("GraphQL response did not include data.");
  }

  return result.data;
}

export async function mutateGraphql<TData, TVariables extends AnyVariables>(
  document: TypedDocumentNode<TData, TVariables>,
  variables: TVariables,
): Promise<TData> {
  const result = await getGraphqlClient()
    .mutation<TData, TVariables>(document, variables)
    .toPromise();

  if (result.error) {
    throw result.error;
  }

  if (!result.data) {
    throw new Error("GraphQL response did not include data.");
  }

  return result.data;
}
