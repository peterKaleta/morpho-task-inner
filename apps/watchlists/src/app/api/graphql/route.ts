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

export function GET(request: Request) {
  return yoga.handle(request);
}

export function POST(request: Request) {
  return yoga.handle(request);
}
