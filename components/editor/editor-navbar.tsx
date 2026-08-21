"use client";

import { UserButton } from "@clerk/nextjs";
import {
  LayoutTemplate,
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
  /** Opens the starter template picker. Rendered only with a project open. */
  onOpenTemplates: () => void;
  isAiSidebarOpen: boolean;
  onToggleAiSidebar: () => void;
  className?: string;
}

/**
 * Fixed-height chrome across the top of every editor screen: the sidebar toggle
 * on the left, the open project's name in the centre, and the workspace actions on
 * the right.
 *
 * The templates entry point, the share button, and the AI toggle belong to a
 * project, so they appear only once one is open. Share opens the share dialog for
 * both an owner and a collaborator — the dialog itself decides what each may do,
 * from the server's answer rather than from anything this bar knows.
 *
 * The right-hand side ends in **either** those project actions **or** Clerk's user
 * menu, never both: with a project open the user menu is part of the canvas'
 * participant group, where it sits beside the other people in the room.
 */
export function EditorNavbar({
  isSidebarOpen,
  onToggleSidebar,
  projectName = null,
  onShareProject,
  onOpenTemplates,
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
            {/*
             * Templates sits before Share, and is a ghost button rather than an
             * outlined one, because it acts on the canvas while Share acts on the
             * project: the outlined button stays the one workspace-level action in the
             * bar, and this reads as a canvas tool beside it.
             *
             * The label is shown as well as the icon, unlike the AI toggle. Opening a
             * picker that can replace the whole architecture should not depend on
             * recognising a glyph, and it is only hidden on the narrowest screens,
             * where the accessible name carries it.
             */}
            <Button variant="ghost" size="sm" onClick={onOpenTemplates}>
              <LayoutTemplate data-icon="inline-start" />
              <span className="max-sm:sr-only">Templates</span>
            </Button>

            <Button variant="outline" size="sm" onClick={onShareProject}>
              <Share2 data-icon="inline-start" />
              Share
            </Button>

            <Button
              variant="ghost"
              size="icon"
              aria-expanded={isAiSidebarOpen}
              aria-label={
                isAiSidebarOpen ? "Close AI workspace" : "Open AI workspace"
              }
              onClick={onToggleAiSidebar}
            >
              <Sparkles />
            </Button>
          </>
        ) : (
          /*
           * Clerk's own menu — profile settings and sign-out, left as built.
           *
           * On the editor home only. With a project open the same button is rendered
           * inside the canvas' participant group, next to the other people in the room,
           * so that the current user appears **once**: leaving it here as well would
           * show them twice, in two places, a few pixels apart.
           *
           * Nothing about the button itself changed, and neither did the project
           * actions above — the menu moved, it was not replaced.
           */
          <UserButton />
        )}
      </div>
    </header>
  );
}
