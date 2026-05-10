import { NextResponse } from "next/server";

import {
  getClearSessionCookieOptions,
  SESSION_COOKIE_NAME,
} from "@/server/auth/session";

export const runtime = "nodejs";

export async function POST() {
  const response = NextResponse.json({ ok: true });

  response.cookies.set(SESSION_COOKIE_NAME, "", getClearSessionCookieOptions());

  return response;
}
