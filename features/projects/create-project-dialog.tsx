"use client";

import { EditorDialog } from "@/components/editor/editor-dialog";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ProjectDialogError } from "@/features/projects/project-dialog-error";
import type { ProjectActionsController } from "@/hooks/use-project-actions";

interface CreateProjectDialogProps {
  projectActions: ProjectActionsController;
}

/**
 * Names a new project, then opens it. The project's identifier is assigned by the
 * server and returned in the response, so there is nothing derived from the name
 * to preview here.
 */
export function CreateProjectDialog({
  projectActions,
}: CreateProjectDialogProps) {
  const {
    mode,
    name,
    setName,
    canSubmitName,
    isSubmitting,
    error,
    setDialogOpen,
    submitCreate,
  } = projectActions;

  return (
    <EditorDialog
      open={mode === "create"}
      onOpenChange={setDialogOpen}
      title="New project"
      description="Name the project. You can rename it later."
      footer={
        <>
          <DialogClose asChild>
            <Button variant="outline" disabled={isSubmitting}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            form="create-project-form"
            disabled={!canSubmitName || isSubmitting}
          >
            {isSubmitting ? "Creating…" : "Create project"}
          </Button>
        </>
      }
    >
      <form
        id="create-project-form"
        className="flex flex-col gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void submitCreate();
        }}
      >
        <label
          htmlFor="create-project-name"
          className="text-sm font-semibold tracking-tight"
        >
          Project name
        </label>
        <Input
          id="create-project-name"
          value={name}
          autoFocus
          autoComplete="off"
          disabled={isSubmitting}
          placeholder="Invoice Intake Automation"
          onChange={(event) => setName(event.target.value)}
        />
        <ProjectDialogError error={error} />
      </form>
    </EditorDialog>
  );
}
