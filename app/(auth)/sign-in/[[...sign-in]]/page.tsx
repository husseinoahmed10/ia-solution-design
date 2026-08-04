import { SignIn } from "@clerk/nextjs";

import { AFTER_SIGN_IN_URL } from "@/lib/auth-routes";

/**
 * Catch-all so Clerk can route its own sub-steps — SSO callbacks, second
 * factors, password reset — under the same path. Appearance comes from
 * `ClerkProvider`.
 */
export default function SignInPage() {
  return <SignIn fallbackRedirectUrl={AFTER_SIGN_IN_URL} />;
}
