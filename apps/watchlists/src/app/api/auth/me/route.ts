import { NextResponse } from "next/server";

import { getCurrentUser } from "@/server/services/auth/current-user";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = await getCurrentUser(request);

  return NextResponse.json({ user });
}
