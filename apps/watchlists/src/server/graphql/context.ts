import { getCurrentUser, type CurrentUser } from "@/server/auth/current-user";

export type GraphqlContext = {
  currentUser: CurrentUser | null;
};

export async function createGraphqlContext(
  request: Pick<Request, "headers">,
): Promise<GraphqlContext> {
  return {
    currentUser: await getCurrentUser(request),
  };
}
