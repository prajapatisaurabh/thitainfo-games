import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createToken } from "@/lib/socket/token-store";
import { rateLimit } from "@/lib/rate-limit";

export function POST(request) {
  const limited = rateLimit(request, { limit: 20, windowMs: 60_000 });
  if (limited) return limited;

  const token = randomUUID();
  createToken(token);
  return NextResponse.json({ token });
}
