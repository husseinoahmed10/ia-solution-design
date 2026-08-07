"use client";

import { EditorDialog } from "@/components/editor/editor-dialog";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ProjectDialogError } from "@/features/projects/project-dialog-error";
import type { ProjectActionsController } from "@/hooks/use-project-actions";

interface RenameProjectDialogProps {
  projectActions: ProjectActionsController;
}

/**
 * Renames an existing project. The input opens prefilled with the current name
 * and focused, and Enter submits, so a rename is a single keyboard interaction.
 *
 * A rename changes the name only: the project keeps its ID, and so its workspace
 * route and its Liveblocks room are untouched.
 */
export function RenameProjectDialog({
  projectActions,
}: RenameProjectDialogProps) {
  const {
    mode,
    activeProject,
    name,
    setName,
    canSubmitName,
    isSubmitting,
    error,
    setDialogOpen,
    submitRename,
  } = projectActions;

  return (
    <EditorDialog
      open={mode === "rename"}
      onOpenChange={setDialogOpen}
      title="Rename project"
      description={
        activeProject ? (
          <>
            Currently named{" "}
            <span className="text-foreground">{activeProject.name}</span>.
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
            type="submit"
            form="rename-project-form"
            disabled={!canSubmitName || isSubmitting}
          >
            {isSubmitting ? "Saving…" : "Save name"}
          </Button>
        </>
      }
    >
      <form
        id="rename-project-form"
        className="flex flex-col gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void submitRename();
        }}
      >
        <label
          htmlFor="rename-project-name"
          className="text-sm font-semibold tracking-tight"
        >
          Project name
        </label>
        <Input
          id="rename-project-name"
          value={name}
          autoFocus
          autoComplete="off"
          disabled={isSubmitting}
          onChange={(event) => setName(event.target.value)}
        />
        <ProjectDialogError error={error} />
      </form>
    </EditorDialog>
  );
}
