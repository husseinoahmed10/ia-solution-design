"use client";

import { useCallback, useMemo, useState } from "react";

import { toProjectSlug } from "@/features/projects/project-slug";
import type { ProjectSummary } from "@/features/projects/project-types";

export type ProjectDialogMode = "create" | "rename" | "delete";

interface ProjectDialog {
  mode: ProjectDialogMode;
  /** The project being acted on. Always `null` for `create`. */
  project: ProjectSummary | null;
}

/**
 * Owns the state behind the three project dialogs: which dialog is open, the
 * name being typed, and whether a confirmation is in flight. One hook holds all
 * three so opening a dialog, prefilling it, and clearing it stay in a single
 * place and the dialog components remain presentational.
 *
 * This unit has no persistence, so `confirm` only manages the loading state and
 * closes the dialog. The mutation call belongs inside it when the project API
 * exists.
 */
export function useProjectDialogs() {
  const [dialog, setDialog] = useState<ProjectDialog | null>(null);
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openCreateDialog = useCallback(() => {
    setName("");
    setDialog({ mode: "create", project: null });
  }, []);

  const openRenameDialog = useCallback((project: ProjectSummary) => {
    setName(project.name);
    setDialog({ mode: "rename", project });
  }, []);

  const openDeleteDialog = useCallback((project: ProjectSummary) => {
    setName("");
    setDialog({ mode: "delete", project });
  }, []);

  const closeDialog = useCallback(() => {
    setDialog(null);
    setName("");
    setIsSubmitting(false);
  }, []);

  /** Matches the Radix `onOpenChange` contract, which also fires on dismiss. */
  const setDialogOpen = useCallback(
    (open: boolean) => {
      if (!open) {
        closeDialog();
      }
    },
    [closeDialog]
  );

  const confirm = useCallback(() => {
    setIsSubmitting(true);
    closeDialog();
  }, [closeDialog]);

  const slugPreview = useMemo(() => toProjectSlug(name), [name]);

  return {
    mode: dialog?.mode ?? null,
    /** The project the open dialog acts on, or `null` for the create dialog. */
    activeProject: dialog?.project ?? null,
    name,
    setName,
    slugPreview,
    isSubmitting,
    /** A blank or whitespace-only name cannot be submitted. */
    canSubmitName: name.trim().length > 0,
    openCreateDialog,
    openRenameDialog,
    openDeleteDialog,
    closeDialog,
    setDialogOpen,
    confirm,
  };
}

export type ProjectDialogsController = ReturnType<typeof useProjectDialogs>;
