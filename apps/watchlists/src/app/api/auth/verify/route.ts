import { NextResponse } from "next/server";

import { isAuthError } from "@/server/services/auth/errors";
import {
  createSessionPayload,
  getSessionCookieOptions,
  SESSION_COOKIE_NAME,
  signSessionPayload,
} from "@/server/services/auth/session";
import { verifyWalletSignature } from "@/server/services/auth/service";
import { verifyRequestSchema } from "@/server/services/auth/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await readJson(request);
  const parsedBody = verifyRequestSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const user = await verifyWalletSignature(parsedBody.data);
    const sessionPayload = createSessionPayload(user);
    const response = NextResponse.json({ user });

    response.cookies.set(
      SESSION_COOKIE_NAME,
      signSessionPayload(sessionPayload),
      getSessionCookieOptions(sessionPayload),
    );

    return response;
  } catch (error) {
    if (isAuthError(error)) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    throw error;
  }
}

async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}
