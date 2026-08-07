"use client";

import { EditorDialog } from "@/components/editor/editor-dialog";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import { ProjectDialogError } from "@/features/projects/project-dialog-error";
import type { ProjectActionsController } from "@/hooks/use-project-actions";

interface DeleteProjectDialogProps {
  projectActions: ProjectActionsController;
}

/**
 * Confirms deleting a project. It carries no input — the project is already
 * identified by the sidebar action that opened it, so the only decision left is
 * whether to go ahead.
 *
 * The body appears only to report a failure, so the dialog stays open with the
 * reason rather than closing on an action that did not happen.
 */
export function DeleteProjectDialog({
  projectActions,
}: DeleteProjectDialogProps) {
  const { mode, activeProject, isSubmitting, error, setDialogOpen, submitDelete } =
    projectActions;

  return (
    <EditorDialog
      open={mode === "delete"}
      onOpenChange={setDialogOpen}
      title="Delete project"
      description={
        activeProject ? (
          <>
            <span className="text-foreground">{activeProject.name}</span> and
            everything in it — documents, requirements, and designs — will be
            deleted. This cannot be undone.
          </>
        ) : undefined
      }
      footer={
        <>
          <DialogClose asChild>
            <Button variant="outline" disabled={isSubmitting}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            disabled={isSubmitting}
            onClick={() => void submitDelete()}
          >
            {isSubmitting ? "Deleting…" : "Delete project"}
          </Button>
        </>
      }
    >
      {error ? <ProjectDialogError error={error} /> : null}
    </EditorDialog>
  );
}
