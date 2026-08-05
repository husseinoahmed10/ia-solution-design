"use client";

import { EditorDialog } from "@/components/editor/editor-dialog";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import type { ProjectDialogsController } from "@/features/projects/use-project-dialogs";

interface DeleteProjectDialogProps {
  dialogs: ProjectDialogsController;
}

/**
 * Confirms deleting a project. It carries no input — the project is already
 * identified by the sidebar action that opened it, so the only decision left is
 * whether to go ahead.
 */
export function DeleteProjectDialog({ dialogs }: DeleteProjectDialogProps) {
  const { mode, activeProject, isSubmitting, setDialogOpen, confirm } = dialogs;

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
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant="destructive" disabled={isSubmitting} onClick={confirm}>
            Delete project
          </Button>
        </>
      }
    />
  );
}
