"use client";

import { UserButton } from "@clerk/nextjs";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Share2,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EditorNavbarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  /**
   * The open project's name, or `null` on the editor home. It labels the bar
   * only — the workspace is identified by its ID everywhere else.
   */
  projectName?: string | null;
  /** Opens the share dialog. Rendered only with a project open. */
  onShareProject: () => void;
  isAiSidebarOpen: boolean;
  onToggleAiSidebar: () => void;
  className?: string;
}

/**
 * Fixed-height chrome across the top of every editor screen: the sidebar toggle
 * on the left, the open project's name in the centre, and the workspace actions
 * with Clerk's user menu on the right.
 *
 * The share button and the AI toggle belong to a project, so they appear only
 * once one is open. Share opens the share dialog for both an owner and a
 * collaborator — the dialog itself decides what each may do, from the server's
 * answer rather than from anything this bar knows.
 */
export function EditorNavbar({
  isSidebarOpen,
  onToggleSidebar,
  projectName = null,
  onShareProject,
  isAiSidebarOpen,
  onToggleAiSidebar,
  className,
}: EditorNavbarProps) {
  const SidebarIcon = isSidebarOpen ? PanelLeftClose : PanelLeftOpen;

  return (
    <header
      className={cn(
        "flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card px-3",
        className
      )}
    >
      <div className="flex flex-1 items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-expanded={isSidebarOpen}
          aria-label={isSidebarOpen ? "Close projects" : "Open projects"}
          onClick={onToggleSidebar}
        >
          <SidebarIcon />
        </Button>
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
        {projectName ? (
          <h1 className="min-w-0 truncate text-sm font-semibold tracking-tight">
            {projectName}
          </h1>
        ) : null}
      </div>

      <div className="flex flex-1 items-center justify-end gap-2">
        {projectName ? (
          <>
            <Button variant="outline" size="sm" onClick={onShareProject}>
              <Share2 data-icon="inline-start" />
              Share
            </Button>

            <Button
              variant="ghost"
              size="icon"
              aria-expanded={isAiSidebarOpen}
              aria-label={
                isAiSidebarOpen
                  ? "Close AI design assistant"
                  : "Open AI design assistant"
              }
              onClick={onToggleAiSidebar}
            >
              <Sparkles />
            </Button>
          </>
        ) : null}

        {/* Clerk's own menu — profile settings and sign-out, left as built. */}
        <UserButton />
      </div>
    </header>
  );
}
