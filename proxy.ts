import { clerkMiddleware } from "@clerk/nextjs/server";

import { isApiPath, isPublicPath } from "@/lib/auth-routes";

/**
 * Protected-first: only the Clerk sign-in and sign-up paths are public, so any
 * page route added later is protected without touching this file.
 *
 * Route handlers are the one exception, and they are not public. `protect()`
 * redirects a page request but answers anything else — an API call — by
 * rewriting to a 404, which would hide the `401` the project API must return.
 * They therefore authenticate themselves with `await auth()` and own their
 * status codes.
 *
 * This is the coarse gate either way. It is not a substitute for the server-side
 * access checks required at every project read and mutation (see
 * `architecture.md`, invariant 6) — path matching in a proxy can diverge from
 * how Next.js resolves a request, which is why Clerk deprecated
 * `createRouteMatcher`.
 */
export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl;

  if (!isPublicPath(pathname) && !isApiPath(pathname)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Everything except Next.js internals and static assets.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Route handlers, which the pattern above skips.
    "/(api|trpc)(.*)",
  ],
};
