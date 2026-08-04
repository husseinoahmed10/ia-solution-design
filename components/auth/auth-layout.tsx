import type { ReactNode } from "react";

import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";

interface AuthLayoutProps {
  children: ReactNode;
}

/**
 * Two exactly equal halves on large screens — the tinted brand panel on the
 * left, the Clerk form centred on the right. Both tracks are `minmax(0, 1fr)`,
 * so neither half can widen itself to fit its content and the split stays 50/50
 * at every width. Below `lg` the brand panel is dropped and only the form
 * remains, so the page never needs to scroll.
 */
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-full flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <AuthBrandPanel className="hidden lg:flex" />

      <main className="flex items-center justify-center p-6">{children}</main>
    </div>
  );
}
