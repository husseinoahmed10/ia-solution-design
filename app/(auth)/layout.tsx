import { AuthLayout } from "@/components/auth/auth-layout";

/**
 * Frames the sign-in and sign-up routes. These routes sit outside the
 * `(editor)` group so they carry no editor chrome.
 */
export default function AuthRouteLayout({ children }: LayoutProps<"/">) {
  return <AuthLayout>{children}</AuthLayout>;
}
