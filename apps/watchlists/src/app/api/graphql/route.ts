import { createYoga } from "graphql-yoga";

import { createGraphqlContext } from "@/server/graphql/context";
import { schema } from "@/server/graphql/schema";

export const runtime = "nodejs";

const yoga = createYoga({
  schema,
  graphqlEndpoint: "/api/graphql",
  logging: false,
  maskedErrors: false,
  context: ({ request }) => createGraphqlContext(request),
});

export async function GET(request: Request): Promise<Response> {
  return toRouteResponse(await yoga.handle(request));
}

export async function POST(request: Request): Promise<Response> {
  return toRouteResponse(await yoga.handle(request));
}

async function toRouteResponse(response: Response): Promise<Response> {
  return new Response(await response.arrayBuffer(), {
    headers: response.headers,
    status: response.status,
    statusText: response.statusText,
  });
}
