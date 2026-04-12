import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Server-side error logging endpoint.
 * Replace the body of this handler with your preferred error reporter
 * (e.g. Sentry.captureException, Datadog, Logtail, etc.)
 */
export async function POST(request) {
  const limited = rateLimit(request, { limit: 20, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const { message, stack, componentStack, url, timestamp } =
      await request.json();

    // Log to server stdout — visible in your hosting platform's log stream
    console.error("[ClientError]", {
      message,
      url,
      timestamp,
      stack: stack?.slice(0, 500),
      componentStack: componentStack?.slice(0, 500),
    });

    // TODO: replace with your error monitoring service, e.g.:
    // await Sentry.captureException(new Error(message));

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
