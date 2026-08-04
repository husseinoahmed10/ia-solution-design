/**
 * The single source of truth for the two public authentication paths.
 *
 * The values come from Clerk's own environment variables so that the proxy, the
 * `/` redirect, and Clerk's internal redirects all agree on one value. They are
 * `NEXT_PUBLIC_*`, so Next.js inlines them at build time — which is what lets
 * the proxy read them inside the edge runtime.
 *
 * The fallbacks are Clerk's defaults and match the route folders under
 * `app/(auth)/`. Changing an environment variable therefore also requires
 * renaming the matching route folder.
 */
export const SIGN_IN_URL = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || "/sign-in";

export const SIGN_UP_URL = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || "/sign-up";

/** Where a signed-in user belongs. */
export const AFTER_SIGN_IN_URL = "/editor";

/** The only paths reachable without a session. */
const PUBLIC_PATH_PREFIXES = [SIGN_IN_URL, SIGN_UP_URL];

/**
 * True for the auth paths and anything Clerk routes beneath them — SSO
 * callbacks, second factors, email verification — which is why this matches on
 * a prefix rather than an exact path.
 */
export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}
