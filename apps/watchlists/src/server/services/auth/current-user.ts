import { and, eq, getDb, isNull, users, type Database } from "@pk-task/db";

import {
  readCookie,
  SESSION_COOKIE_NAME,
  verifySessionCookieValue,
} from "./session";

export type CurrentUser = {
  id: string;
  walletAddress: string;
};

export async function getCurrentUser(
  request: Pick<Request, "headers">,
  db: Database = getDb(),
): Promise<CurrentUser | null> {
  const sessionPayload = verifySessionCookieValue(
    readCookie(request.headers.get("cookie"), SESSION_COOKIE_NAME),
  );

  if (!sessionPayload) {
    return null;
  }

  const [user] = await db
    .select({
      id: users.id,
      walletAddress: users.walletAddress,
    })
    .from(users)
    .where(and(eq(users.id, sessionPayload.userId), isNull(users.deletedAt)))
    .limit(1);

  return user ?? null;
}
