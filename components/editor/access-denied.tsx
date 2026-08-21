import { Lock } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

/**
 * Shown in place of a workspace the current user may not open.
 *
 * A project that does not exist and one belonging to somebody else render the
 * same screen, so the message is deliberately vague about which it was: naming
 * the difference would confirm that another user's project exists.
 *
 * It is a Server Component — it holds no state and only links back to the
 * editor home, which is the one place the user can certainly reach.
 */
export function AccessDenied() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
        <Lock className="size-5 text-muted-foreground" aria-hidden />
      </div>

      <h1 className="text-2xl font-semibold tracking-tight text-balance">
        You cannot open this project
      </h1>
      <p className="max-w-sm text-sm leading-relaxed text-pretty text-muted-foreground">
        It may have been deleted, or it may not be shared with your account.
      </p>

      <Button variant="outline" asChild>
        <Link href="/editor">Back to projects</Link>
      </Button>
    </div>
  );
}
