import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { AFTER_SIGN_IN_URL, SIGN_IN_URL } from "@/lib/auth-routes";

/**
 * `/` holds no content of its own — it only sends the user to the right place.
 * The proxy already protects this route, so an unauthenticated visitor is
 * redirected to sign-in before this runs; the second branch is the explicit
 * fallback the specification asks for.
 */
export default async function RootPage() {
  const { isAuthenticated } = await auth();

  redirect(isAuthenticated ? AFTER_SIGN_IN_URL : SIGN_IN_URL);
}
