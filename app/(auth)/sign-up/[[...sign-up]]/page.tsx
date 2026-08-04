import { SignUp } from "@clerk/nextjs";

import { AFTER_SIGN_IN_URL } from "@/lib/auth-routes";

/**
 * Catch-all so Clerk can route its own sub-steps — email verification, SSO
 * callbacks — under the same path. Appearance comes from `ClerkProvider`.
 */
export default function SignUpPage() {
  return <SignUp fallbackRedirectUrl={AFTER_SIGN_IN_URL} />;
}
