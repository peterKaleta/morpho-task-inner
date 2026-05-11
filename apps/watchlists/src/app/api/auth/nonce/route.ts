import { NextResponse } from "next/server";

import { isAuthError } from "@/server/services/auth/errors";
import { createAuthNonce } from "@/server/services/auth/service";
import { nonceRequestSchema } from "@/server/services/auth/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await readJson(request);
  const parsedBody = nonceRequestSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const nonce = await createAuthNonce(parsedBody.data.walletAddress);

    return NextResponse.json({
      nonce: nonce.nonce,
      message: nonce.message,
      expiresAt: nonce.expiresAt.toISOString(),
    });
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
