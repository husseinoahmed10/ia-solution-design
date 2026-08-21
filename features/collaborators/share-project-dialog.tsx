"use client";

import { Check, Link2 } from "lucide-react";

import { EditorDialog } from "@/components/editor/editor-dialog";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CollaboratorListItem } from "@/features/collaborators/collaborator-list-item";
import { ProjectDialogError } from "@/features/projects/project-dialog-error";
import type { ShareDialogController } from "@/hooks/use-share-dialog";

interface ShareProjectDialogProps {
  shareDialog: ShareDialogController;
  /** The open project's name, shown in the description. */
  projectName: string;
}

/**
 * Invites collaborators to a project, lists who already has access, and copies the
 * workspace link.
 *
 * The invite field and the remove buttons appear only when the server said this
 * user may manage access, so a collaborator sees the list read-only. That is an
 * affordance — every mutation route resolves ownership itself.
 *
 * The link is copied from the dialog rather than shared automatically, because a
 * link grants nothing on its own: `/editor/[projectId]` runs its own access check,
 * so an invite is what actually gives access.
 */
export function ShareProjectDialog({
  shareDialog,
  projectName,
}: ShareProjectDialogProps) {
  const {
    isOpen,
    setDialogOpen,
    collaborators,
    canManage,
    isLoading,
    loadError,
    email,
    setEmail,
    isInviting,
    inviteError,
    canSubmitInvite,
    removingId,
    isLinkCopied,
    submitInvite,
    submitRemove,
    copyProjectLink,
  } = shareDialog;

  return (
    <EditorDialog
      open={isOpen}
      onOpenChange={setDialogOpen}
      title="Share project"
      description={
        canManage ? (
          <>
            Invite people to work on{" "}
            <span className="text-foreground">{projectName}</span>.
          </>
        ) : (
          <>
            <span className="text-foreground">{projectName}</span> is shared with
            you. Only its owner can change who has access.
          </>
        )
      }
      footer={
        <>
          {/*
            * Not a submit button: copying is its own action and must not close the
            * dialog, so the `Copied!` feedback stays visible where it happened.
            */}
          <Button
            variant="outline"
            className="mr-auto"
            onClick={() => void copyProjectLink()}
          >
            {isLinkCopied ? (
              <Check data-icon="inline-start" />
            ) : (
              <Link2 data-icon="inline-start" />
            )}
            {isLinkCopied ? "Copied!" : "Copy link"}
          </Button>

          <DialogClose asChild>
            <Button variant="outline">Done</Button>
          </DialogClose>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {canManage ? (
          <form
            className="flex flex-col gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              void submitInvite();
            }}
          >
            <label
              htmlFor="invite-collaborator-email"
              className="text-sm font-semibold tracking-tight"
            >
              Invite by email
            </label>
            <div className="flex items-center gap-2">
              <Input
                id="invite-collaborator-email"
                type="email"
                value={email}
                autoComplete="off"
                disabled={isInviting}
                placeholder="colleague@ssctech.com"
                onChange={(event) => setEmail(event.target.value)}
              />
              <Button
                type="submit"
                className="shrink-0"
                disabled={!canSubmitInvite || isInviting}
              >
                {isInviting ? "Inviting…" : "Invite"}
              </Button>
            </div>
          </form>
        ) : null}

        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold tracking-tight">
            People with access
          </h3>

          {isLoading ? (
            <p className="px-1 py-4 text-sm text-muted-foreground">
              Loading collaborators…
            </p>
          ) : loadError ? (
            <ProjectDialogError error={loadError} />
          ) : collaborators.length > 0 ? (
            <ScrollArea className="max-h-56">
              <ul className="flex flex-col gap-0.5">
                {collaborators.map((collaborator) => (
                  <CollaboratorListItem
                    key={collaborator.id}
                    collaborator={collaborator}
                    canManage={canManage}
                    isRemoving={removingId === collaborator.id}
                    onRemove={(collaboratorId) =>
                      void submitRemove(collaboratorId)
                    }
                  />
                ))}
              </ul>
            </ScrollArea>
          ) : (
            <p className="px-1 py-4 text-sm text-muted-foreground">
              {canManage
                ? "No one else has access yet."
                : "No other collaborators."}
            </p>
          )}
        </div>

        <ProjectDialogError error={inviteError} />
      </div>
    </EditorDialog>
  );
}
