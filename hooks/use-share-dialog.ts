"use client";

import { useCallback, useEffect, useState } from "react";

import {
  fetchCollaborators,
  inviteCollaborator,
  removeCollaborator,
} from "@/features/collaborators/collaborator-client";
import type { CollaboratorSummary } from "@/features/collaborators/collaborator-types";

interface UseShareDialogOptions {
  /** The open workspace, or `null` on the editor home, where sharing has no subject. */
  projectId: string | null;
}

/**
 * Owns the share dialog: whether it is open, the collaborator list, the email
 * being typed, which row is being removed, and the copy-link feedback.
 *
 * One hook holds all of it so the dialog components stay presentational, matching
 * how `useProjectActions` owns the three project dialogs.
 *
 * The list is fetched when the dialog opens rather than with the page, because the
 * navbar renders on every editor screen and most visits never open it. `canManage`
 * comes from that response, so the owner controls are enabled by the server's
 * answer rather than by a guess the client makes.
 */
export function useShareDialog({ projectId }: UseShareDialogOptions) {
  /*
   * Which project the dialog is open *for*, rather than a bare boolean.
   *
   * The hook lives in `EditorShell` and so survives navigation between projects,
   * while `open()` only resets state on the way in. Storing the subject closes the
   * dialog the instant the route's project changes, so the previous project's
   * collaborators and `canManage` can never be rendered under the new project's
   * name — not even for the moment before a refetch lands, which would otherwise
   * briefly offer an owner's invite form for a project the user may only be able
   * to view.
   */
  const [openForProjectId, setOpenForProjectId] = useState<string | null>(null);

  /*
   * Discards a subject the route has moved away from, during render.
   *
   * Deriving `isOpen` from a *match* alone would not be enough: the stale ID would
   * survive, so navigating away from a project and back again would spring the
   * dialog open with no user action. Clearing it here — React's documented
   * adjust-state-during-render pattern — resolves before the browser sees anything,
   * unlike an effect, which would commit one render with the two disagreeing and
   * cascade a second.
   */
  if (openForProjectId !== null && openForProjectId !== projectId) {
    setOpenForProjectId(null);
  }

  const isOpen = openForProjectId !== null;

  const [collaborators, setCollaborators] = useState<CollaboratorSummary[]>([]);
  const [canManage, setCanManage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const [removingId, setRemovingId] = useState<string | null>(null);
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  /**
   * Opens the dialog on a clean slate.
   *
   * This is the **only** way the dialog opens — `setDialogOpen(true)` routes
   * through it — so the pending state for the load below is established here,
   * where it is a plain event handler, rather than synchronously inside the effect
   * that performs the fetch.
   *
   * The previous project's list is cleared as well as the form, so reopening never
   * shows another project's collaborators while the new request is in flight.
   */
  const open = useCallback(() => {
    if (!projectId) {
      return;
    }

    setEmail("");
    setInviteError(null);
    setIsLinkCopied(false);
    setCollaborators([]);
    setCanManage(false);
    setLoadError(null);
    setIsLoading(true);
    setOpenForProjectId(projectId);
  }, [projectId]);

  /** Matches the Radix `onOpenChange` contract, which also fires on dismiss. */
  const setDialogOpen = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        open();
        return;
      }

      setOpenForProjectId(null);
    },
    [open]
  );

  /*
   * Loads the list each time the dialog opens, so a list that changed while the
   * dialog was closed is not shown stale. `ignore` drops the response of a request
   * whose dialog has already been closed, which would otherwise write into state
   * the next open has already reset.
   */
  useEffect(() => {
    if (!isOpen || !projectId) {
      return;
    }

    let ignore = false;

    void fetchCollaborators(projectId).then((result) => {
      if (ignore) {
        return;
      }

      setIsLoading(false);

      if (!result.ok) {
        setLoadError(result.error);
        return;
      }

      setCollaborators(result.list.collaborators);
      setCanManage(result.list.canManage);
    });

    return () => {
      ignore = true;
    };
  }, [isOpen, projectId]);

  /**
   * Invites the typed address and appends the returned collaborator.
   *
   * The row comes from the response rather than being assembled locally, so the
   * ID a removal needs and the Clerk name and avatar are the server's, not a
   * guess. A failure leaves the address in the field to correct and retry.
   */
  const submitInvite = useCallback(async () => {
    const trimmedEmail = email.trim();

    if (!projectId || trimmedEmail.length === 0) {
      return;
    }

    setIsInviting(true);
    setInviteError(null);

    const result = await inviteCollaborator(projectId, trimmedEmail);

    setIsInviting(false);

    if (!result.ok) {
      setInviteError(result.error);
      return;
    }

    setCollaborators((current) => [...current, result.collaborator]);
    setEmail("");
  }, [email, projectId]);

  /**
   * Removes one collaborator. The row is dropped only once the server has
   * confirmed it, so a failed removal cannot leave the list showing access that
   * still exists.
   */
  const submitRemove = useCallback(
    async (collaboratorId: string) => {
      if (!projectId) {
        return;
      }

      setRemovingId(collaboratorId);
      setInviteError(null);

      const result = await removeCollaborator(projectId, collaboratorId);

      setRemovingId(null);

      if (!result.ok) {
        setInviteError(result.error);
        return;
      }

      setCollaborators((current) =>
        current.filter((collaborator) => collaborator.id !== collaboratorId)
      );
    },
    [projectId]
  );

  /**
   * Copies the workspace link and shows `Copied!` briefly.
   *
   * The URL is built from `window.location.origin` and the project ID, so it is
   * the same address the sidebar links to and nothing is derived from the project
   * name. The clipboard write can be refused — an insecure origin or a denied
   * permission — so a failure reports itself rather than showing false success.
   */
  const copyProjectLink = useCallback(async () => {
    if (!projectId) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/editor/${projectId}`
      );

      setIsLinkCopied(true);
    } catch {
      setInviteError("The link could not be copied.");
    }
  }, [projectId]);

  /*
   * Clears the `Copied!` label after a moment. It lives in an effect rather than a
   * `setTimeout` inside the handler so the timer is cancelled if the dialog closes
   * or the link is copied again first, which a bare timeout would leak.
   */
  useEffect(() => {
    if (!isLinkCopied) {
      return;
    }

    const timer = window.setTimeout(() => setIsLinkCopied(false), 2000);

    return () => window.clearTimeout(timer);
  }, [isLinkCopied]);

  return {
    isOpen,
    setDialogOpen,
    open,
    collaborators,
    /** Whether the server says this user may invite and remove. */
    canManage,
    isLoading,
    loadError,
    email,
    setEmail,
    isInviting,
    /** A failed invite, removal, or copy, shown inside the dialog. */
    inviteError,
    canSubmitInvite: email.trim().length > 0,
    removingId,
    isLinkCopied,
    submitInvite,
    submitRemove,
    copyProjectLink,
  };
}

export type ShareDialogController = ReturnType<typeof useShareDialog>;
