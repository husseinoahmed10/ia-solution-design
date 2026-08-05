"use client";

import { EditorDialog } from "@/components/editor/editor-dialog";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { ProjectDialogsController } from "@/features/projects/use-project-dialogs";

interface RenameProjectDialogProps {
  dialogs: ProjectDialogsController;
}

/**
 * Renames an existing project. The input opens prefilled with the current name
 * and focused, and Enter submits, so a rename is a single keyboard interaction.
 */
export function RenameProjectDialog({ dialogs }: RenameProjectDialogProps) {
  const {
    mode,
    activeProject,
    name,
    setName,
    canSubmitName,
    isSubmitting,
    setDialogOpen,
    confirm,
  } = dialogs;

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
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            type="submit"
            form="rename-project-form"
            disabled={!canSubmitName || isSubmitting}
          >
            Save name
          </Button>
        </>
      }
    >
      <form
        id="rename-project-form"
        className="flex flex-col gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (canSubmitName) {
            confirm();
          }
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
          onChange={(event) => setName(event.target.value)}
        />
      </form>
    </EditorDialog>
  );
}
