"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import {
  createProject,
  deleteProject,
  renameProject,
} from "@/features/projects/project-client";
import type { ProjectSummary } from "@/features/projects/project-types";

export type ProjectDialogMode = "create" | "rename" | "delete";

interface ProjectDialog {
  mode: ProjectDialogMode;
  /** The project being acted on. Always `null` for `create`. */
  project: ProjectSummary | null;
}

/**
 * Owns the three project dialogs and the mutations behind them: which dialog is
 * open, the name being typed, whether a call is in flight, and what to do with
 * the result.
 *
 * One hook holds all three so opening a dialog, prefilling it, submitting it,
 * and clearing it stay in a single place and the dialog components remain
 * presentational.
 *
 * The project ID is the workspace identifier throughout — the create response's
 * ID is both the route segment navigated to and the Liveblocks room ID the server
 * created, and a rename never touches it. Nothing here derives an identifier from
 * a project name.
 */
export function useProjectActions() {
  const router = useRouter();
  /** `undefined` on `/editor`; the open workspace on `/editor/[projectId]`. */
  const { projectId: activeProjectId } = useParams<{ projectId?: string }>();

  const [dialog, setDialog] = useState<ProjectDialog | null>(null);
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openCreateDialog = useCallback(() => {
    setName("");
    setError(null);
    setDialog({ mode: "create", project: null });
  }, []);

  const openRenameDialog = useCallback((project: ProjectSummary) => {
    setName(project.name);
    setError(null);
    setDialog({ mode: "rename", project });
  }, []);

  const openDeleteDialog = useCallback((project: ProjectSummary) => {
    setName("");
    setError(null);
    setDialog({ mode: "delete", project });
  }, []);

  const closeDialog = useCallback(() => {
    setDialog(null);
    setName("");
    setIsSubmitting(false);
    setError(null);
  }, []);

  /**
   * Matches the Radix `onOpenChange` contract, which also fires on dismiss. A
   * dismiss is ignored while a mutation is in flight, so the dialog cannot be
   * closed out from under a request whose result it still has to report.
   */
  const setDialogOpen = useCallback(
    (open: boolean) => {
      if (!open && !isSubmitting) {
        closeDialog();
      }
    },
    [closeDialog, isSubmitting]
  );

  /**
   * Creates the project, then opens it.
   *
   * The ID comes from the response rather than from the name, so the project
   * row, the workspace route, and the room the server created all share one
   * identifier. `refresh()` runs as well as `push()`, because the sidebar is
   * rendered by the editor layout, which a navigation within the same layout
   * does not re-render.
   */
  const submitCreate = useCallback(async () => {
    const trimmedName = name.trim();

    if (trimmedName.length === 0) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await createProject(trimmedName);

    if (!result.ok) {
      setIsSubmitting(false);
      setError(result.error);
      return;
    }

    closeDialog();
    router.push(`/editor/${result.project.id}`);
    router.refresh();
  }, [closeDialog, name, router]);

  /** Renames the project. Its ID, and so its room, are unaffected. */
  const submitRename = useCallback(async () => {
    const trimmedName = name.trim();
    const project = dialog?.project;

    if (!project || trimmedName.length === 0) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await renameProject(project.id, trimmedName);

    if (!result.ok) {
      setIsSubmitting(false);
      setError(result.error);
      return;
    }

    closeDialog();
    router.refresh();
  }, [closeDialog, dialog?.project, name, router]);

  /**
   * Deletes the project and, on the server, its room.
   *
   * Deleting the project that is currently open leaves the route pointing at
   * something that no longer exists, so that case also redirects to `/editor`.
   * `replace` rather than `push`, so Back does not return to the dead workspace.
   * The refresh still runs either way: `/editor/[projectId]` and `/editor` share
   * the editor layout, and a navigation within one layout reuses it, so the
   * redirect alone would leave the deleted project in the sidebar.
   */
  const submitDelete = useCallback(async () => {
    const project = dialog?.project;

    if (!project) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await deleteProject(project.id);

    if (!result.ok) {
      setIsSubmitting(false);
      setError(result.error);
      return;
    }

    const wasActiveWorkspace = project.id === activeProjectId;

    closeDialog();

    if (wasActiveWorkspace) {
      router.replace("/editor");
    }

    router.refresh();
  }, [activeProjectId, closeDialog, dialog?.project, router]);

  return {
    mode: dialog?.mode ?? null,
    /** The project the open dialog acts on, or `null` for the create dialog. */
    activeProject: dialog?.project ?? null,
    name,
    setName,
    isSubmitting,
    /** The message from a failed mutation, shown inside the open dialog. */
    error,
    /** A blank or whitespace-only name cannot be submitted. */
    canSubmitName: name.trim().length > 0,
    openCreateDialog,
    openRenameDialog,
    openDeleteDialog,
    closeDialog,
    setDialogOpen,
    submitCreate,
    submitRename,
    submitDelete,
  };
}

export type ProjectActionsController = ReturnType<typeof useProjectActions>;
