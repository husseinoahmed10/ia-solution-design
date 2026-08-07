"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useProjectActionsContext } from "@/features/projects/project-actions-context";

/**
 * The empty editor canvas: what the user sees before a project is open. It is
 * deliberately plain — no card, no panel — so the create action is the only
 * thing competing for attention.
 */
export function EditorHome() {
  const { openCreateDialog } = useProjectActionsContext();

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-4xl font-semibold tracking-tight text-balance">
        Create a project or open an existing one
      </h1>
      <p className="max-w-md text-sm leading-relaxed text-pretty text-muted-foreground">
        Start a new architecture workspace, or choose a project from the
        sidebar.
      </p>
      <Button size="lg" onClick={openCreateDialog}>
        <Plus data-icon="inline-start" />
        New Project
      </Button>
    </div>
  );
}
