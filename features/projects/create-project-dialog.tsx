"use client";

import { EditorDialog } from "@/components/editor/editor-dialog";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { ProjectDialogsController } from "@/features/projects/use-project-dialogs";

interface CreateProjectDialogProps {
  dialogs: ProjectDialogsController;
}

/**
 * Names a new project and previews the slug it will be given. The preview is
 * derived from the name on every keystroke, so the user can see the identifier
 * before committing to the name.
 */
export function CreateProjectDialog({ dialogs }: CreateProjectDialogProps) {
  const {
    mode,
    name,
    setName,
    slugPreview,
    canSubmitName,
    isSubmitting,
    setDialogOpen,
    confirm,
  } = dialogs;

  return (
    <EditorDialog
      open={mode === "create"}
      onOpenChange={setDialogOpen}
      title="New project"
      description="Name the project. You can rename it later."
      footer={
        <>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            type="submit"
            form="create-project-form"
            disabled={!canSubmitName || isSubmitting}
          >
            Create project
          </Button>
        </>
      }
    >
      <form
        id="create-project-form"
        className="flex flex-col gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (canSubmitName) {
            confirm();
          }
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
          placeholder="Invoice Intake Automation"
          onChange={(event) => setName(event.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Slug:{" "}
          <span className="font-mono text-foreground">
            {slugPreview || "—"}
          </span>
        </p>
      </form>
    </EditorDialog>
  );
}
