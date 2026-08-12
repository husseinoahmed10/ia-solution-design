"use client";

import { useParams } from "next/navigation";
import { useState, type ReactNode } from "react";

import { AiSidebar } from "@/components/editor/ai-sidebar";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { ShareProjectDialog } from "@/features/collaborators/share-project-dialog";
import { CreateProjectDialog } from "@/features/projects/create-project-dialog";
import { DeleteProjectDialog } from "@/features/projects/delete-project-dialog";
import { ProjectActionsProvider } from "@/features/projects/project-actions-context";
import type { ProjectSummary } from "@/features/projects/project-types";
import { RenameProjectDialog } from "@/features/projects/rename-project-dialog";
import { useProjectActions } from "@/hooks/use-project-actions";
import { useShareDialog } from "@/hooks/use-share-dialog";

interface EditorShellProps {
  /** Fetched server-side by the editor layout, not by the sidebar. */
  ownedProjects: ProjectSummary[];
  sharedProjects: ProjectSummary[];
  children?: ReactNode;
}

/**
 * Frames an editor screen with the navbar and the two side panels, and owns the
 * open state of both. The canvas region is a positioning context so each panel
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
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(false);
  const projectActions = useProjectActions();

  /** `undefined` on `/editor`; the open workspace on `/editor/[projectId]`. */
  const { projectId: activeProjectId } = useParams<{ projectId?: string }>();

  /*
   * The navbar's project name comes from the lists the layout already fetched,
   * matched on the route's ID — the same mechanism the sidebar rows use to mark
   * the open project, so there is one source for "which project is open" and no
   * second query for a name the shell already has.
   *
   * It is `undefined` for an ID that is not in either list, which is exactly the
   * case the workspace route answers with `AccessDenied`: the navbar then shows
   * no name and no project actions, so the chrome cannot imply access the server
   * refused.
   */
  const activeProject = activeProjectId
    ? [...ownedProjects, ...sharedProjects].find(
        (project) => project.id === activeProjectId
      )
    : undefined;

  /*
   * Keyed to the *resolved* project rather than the route's ID, so the dialog can
   * only ever load collaborators for a project the server already returned in one
   * of the lists.
   */
  const shareDialog = useShareDialog({ projectId: activeProject?.id ?? null });

  const closeSidebar = () => setIsSidebarOpen(false);
  const closeAiSidebar = () => setIsAiSidebarOpen(false);

  return (
    <ProjectActionsProvider projectActions={projectActions}>
      <div className="flex min-h-0 flex-1 flex-col">
        <EditorNavbar
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
          projectName={activeProject?.name ?? null}
          onShareProject={shareDialog.open}
          isAiSidebarOpen={isAiSidebarOpen}
          onToggleAiSidebar={() => setIsAiSidebarOpen((open) => !open)}
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

          {/*
           * Mounted only with a project open, because its toggle lives in the
           * navbar's project actions: without this, leaving a workspace with the
           * panel open would strand it there with nothing left to close it.
           */}
          {activeProject ? (
            <AiSidebar isOpen={isAiSidebarOpen} onClose={closeAiSidebar} />
          ) : null}
        </div>
      </div>

      <CreateProjectDialog projectActions={projectActions} />
      <RenameProjectDialog projectActions={projectActions} />
      <DeleteProjectDialog projectActions={projectActions} />

      {/*
       * Mounted only with a project open, for the same reason as the AI panel: the
       * only control that opens it is the navbar's share button, which is itself
       * scoped to a project.
       */}
      {activeProject ? (
        <ShareProjectDialog
          shareDialog={shareDialog}
          projectName={activeProject.name}
        />
      ) : null}
    </ProjectActionsProvider>
  );
}
