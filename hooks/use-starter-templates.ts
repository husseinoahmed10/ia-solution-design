"use client";

import { useCallback, useState } from "react";

interface UseStarterTemplatesOptions {
  /**
   * The open workspace, or `null` on the editor home, where there is no canvas to
   * import a template into.
   */
  projectId: string | null;
}

export interface StarterTemplatesController {
  isOpen: boolean;
  /** Opens the picker. The navbar's Templates button. */
  open: () => void;
  /** The dialog's own `onOpenChange`: closing on Cancel, Escape, or the overlay. */
  setDialogOpen: (open: boolean) => void;
}

/**
 * Owns whether the starter template picker is open.
 *
 * That is **all** it owns. The template library is a module constant, so there is
 * nothing to fetch and nothing to hold; which template is chosen is not state
 * either, because choosing one imports it and closes the dialog in the same click.
 *
 * It is mounted in `EditorShell` rather than in the canvas, because the control that
 * opens the picker is in the navbar, which the shell renders — while the import
 * itself belongs to the canvas, which is the only thing holding the room's state.
 * The shell shares this controller down through
 * `features/canvas/starter-templates-context.tsx`, so there is one instance and no
 * second copy of the open flag on either side of that boundary.
 *
 * The open state is keyed to a **project** rather than being a bare boolean, exactly
 * as `useShareDialog`'s is, and for the same reason: this hook lives in the shell and
 * so survives navigation between workspaces. Storing the subject closes the picker
 * the moment the route's project changes, so a dialog opened over one project's
 * canvas cannot reappear over another's — where its next click would replace an
 * architecture the user had not been looking at when they opened it.
 */
export function useStarterTemplates({
  projectId,
}: UseStarterTemplatesOptions): StarterTemplatesController {
  const [openForProjectId, setOpenForProjectId] = useState<string | null>(null);

  /*
   * Discards a subject the route has moved away from, during render — React's
   * adjust-state-during-render pattern, as the share dialog uses. Deriving `isOpen`
   * from a match alone would leave the stale ID behind, so navigating away from a
   * project and back would spring the picker open with no user action.
   */
  if (openForProjectId !== null && openForProjectId !== projectId) {
    setOpenForProjectId(null);
  }

  /*
   * `projectId` being `null` therefore keeps the picker shut rather than opening it
   * over nothing. The navbar's button is already scoped to an open project, so this
   * is a floor under that rather than the mechanism.
   */
  const open = useCallback(() => {
    setOpenForProjectId(projectId);
  }, [projectId]);

  const setDialogOpen = useCallback(
    (nextOpen: boolean) => {
      setOpenForProjectId(nextOpen ? projectId : null);
    },
    [projectId]
  );

  return {
    isOpen: openForProjectId !== null,
    open,
    setDialogOpen,
  };
}
