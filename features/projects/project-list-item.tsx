"use client";

import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import type { ProjectSummary } from "@/features/projects/project-types";
import { cn } from "@/lib/utils";

interface ProjectListItemProps {
  project: ProjectSummary;
  onRename: (project: ProjectSummary) => void;
  onDelete: (project: ProjectSummary) => void;
}

/**
 * One row in the sidebar project list. Rename and delete are shown only for a
 * project the user owns; a collaborator sees the name alone. The actions stay in
 * the DOM only when they apply, so they cannot be reached by keyboard on a
 * shared project.
 *
 * They are revealed on hover and on keyboard focus, so tabbing to them makes
 * them visible.
 *
 * The name is the link that opens the workspace — this is how a project is
 * opened from the sidebar, which is what the editor home directs the user to do.
 * It addresses the project by `id` alone, so opening a project needs nothing
 * derived from its name. The route still runs its own access check: this list is
 * an affordance, not an authorisation.
 */
export function ProjectListItem({
  project,
  onRename,
  onDelete,
}: ProjectListItemProps) {
  const isOwned = project.access === "owner";
  /** `undefined` on `/editor`; the open workspace on `/editor/[projectId]`. */
  const { projectId: activeProjectId } = useParams<{ projectId?: string }>();
  const isActive = project.id === activeProjectId;

  return (
    <li className="group flex items-center gap-1 rounded-md px-2 py-1.5 hover:bg-accent focus-within:bg-accent">
      <Link
        href={`/editor/${project.id}`}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "min-w-0 flex-1 truncate rounded-sm text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
          isActive ? "font-medium text-foreground" : "text-muted-foreground"
        )}
      >
        {project.name}
      </Link>

      {isOwned ? (
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={`Rename ${project.name}`}
            onClick={() => onRename(project)}
          >
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={`Delete ${project.name}`}
            className="text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(project)}
          >
            <Trash2 />
          </Button>
        </div>
      ) : null}
    </li>
  );
}
