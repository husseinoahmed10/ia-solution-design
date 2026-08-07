"use client";

import { useState, type ReactNode } from "react";

import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { CreateProjectDialog } from "@/features/projects/create-project-dialog";
import { DeleteProjectDialog } from "@/features/projects/delete-project-dialog";
import { ProjectActionsProvider } from "@/features/projects/project-actions-context";
import type { ProjectSummary } from "@/features/projects/project-types";
import { RenameProjectDialog } from "@/features/projects/rename-project-dialog";
import { useProjectActions } from "@/hooks/use-project-actions";

interface EditorShellProps {
  /** Fetched server-side by the editor layout, not by the sidebar. */
  ownedProjects: ProjectSummary[];
  sharedProjects: ProjectSummary[];
  children?: ReactNode;
}

/**
 * Frames an editor screen with the navbar and the project sidebar, and owns the
 * sidebar open state. The canvas region is a positioning context so the sidebar
 * overlays it instead of pushing it.
 *
 * The project dialogs are mounted here, once, and shared through context, so a
 * screen inside the shell opens the same dialog instances the sidebar does.
 */
export function EditorShell({
  ownedProjects,
  sharedProjects,
  children,
}: EditorShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const projectActions = useProjectActions();

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <ProjectActionsProvider projectActions={projectActions}>
      <div className="flex min-h-0 flex-1 flex-col">
        <EditorNavbar
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
        />

        {/*
         * A flex container, so `main` stretches to the full canvas height. A
         * percentage height on `main` would not resolve here — this region is
         * itself a flex item with an auto height — which left centred page
         * content collapsing to its own height instead of filling the canvas.
         */}
        <div className="relative flex min-h-0 flex-1 overflow-hidden">
          <main className="min-h-0 flex-1">{children}</main>

          {/*
           * Mobile only: the sidebar covers most of a narrow screen, so a scrim
           * both dims the canvas and gives the user somewhere to tap to dismiss
           * it. On `sm` and up the panel is a non-blocking overlay, so there is
           * no scrim and the canvas stays clickable.
           */}
          {isSidebarOpen ? (
            <div
              aria-hidden
              onClick={closeSidebar}
              className="absolute inset-0 z-30 bg-black/50 sm:hidden"
            />
          ) : null}

          <ProjectSidebar
            isOpen={isSidebarOpen}
            onClose={closeSidebar}
            ownedProjects={ownedProjects}
            sharedProjects={sharedProjects}
            onCreateProject={projectActions.openCreateDialog}
            onRenameProject={projectActions.openRenameDialog}
            onDeleteProject={projectActions.openDeleteDialog}
          />
        </div>
      </div>

      <CreateProjectDialog projectActions={projectActions} />
      <RenameProjectDialog projectActions={projectActions} />
      <DeleteProjectDialog projectActions={projectActions} />
    </ProjectActionsProvider>
  );
}
