import { auth } from "@clerk/nextjs/server";

/**
 * The Clerk user ID for the current request, or `null` when there is no
 * session.
 *
 * Route handlers read auth through this rather than through `auth.protect()`.
 * `protect()` answers a non-page request with a 404 rewrite, whereas an API
 * caller must be told `401`, so the handler owns the status code and this only
 * reports who is calling. Every project read and mutation must call it — the
 * proxy is a coarse gate and does not satisfy invariant 6.
 */
export async function getRequestUserId(): Promise<string | null> {
  const { userId } = await auth();

  return userId;
}
