"use client";

import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ProjectListItem } from "@/features/projects/project-list-item";
import type { ProjectSummary } from "@/features/projects/project-types";
import { cn } from "@/lib/utils";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  projects: ProjectSummary[];
  onCreateProject: () => void;
  onRenameProject: (project: ProjectSummary) => void;
  onDeleteProject: (project: ProjectSummary) => void;
  className?: string;
}

/**
 * Project list panel. It floats above the editor canvas and slides in from the
 * left, so opening it never reflows the workspace behind it.
 */
export function ProjectSidebar({
  isOpen,
  onClose,
  projects,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
  className,
}: ProjectSidebarProps) {
  const ownedProjects = projects.filter(
    (project) => project.access === "owner"
  );
  const sharedProjects = projects.filter(
    (project) => project.access === "collaborator"
  );

  return (
    <aside
      aria-label="Projects"
      aria-hidden={!isOpen}
      inert={!isOpen}
      className={cn(
        "absolute inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-border bg-card transition-transform duration-200 ease-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
        className
      )}
    >
      <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border px-3">
        <h2 className="text-sm font-medium">Projects</h2>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Close projects"
          onClick={onClose}
        >
          <X />
        </Button>
      </div>

      <Tabs defaultValue="my-projects" className="min-h-0 flex-1 gap-3 p-3">
        <TabsList className="w-full">
          <TabsTrigger value="my-projects">My Projects</TabsTrigger>
          <TabsTrigger value="shared">Shared</TabsTrigger>
        </TabsList>

        <TabsContent value="my-projects" className="min-h-0">
          <ScrollArea className="h-full">
            {ownedProjects.length > 0 ? (
              <ul className="flex flex-col gap-0.5">
                {ownedProjects.map((project) => (
                  <ProjectListItem
                    key={project.id}
                    project={project}
                    onRename={onRenameProject}
                    onDelete={onDeleteProject}
                  />
                ))}
              </ul>
            ) : (
              <p className="px-1 py-6 text-center text-sm text-muted-foreground">
                No projects yet.
              </p>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="shared" className="min-h-0">
          <ScrollArea className="h-full">
            {sharedProjects.length > 0 ? (
              <ul className="flex flex-col gap-0.5">
                {sharedProjects.map((project) => (
                  <ProjectListItem
                    key={project.id}
                    project={project}
                    onRename={onRenameProject}
                    onDelete={onDeleteProject}
                  />
                ))}
              </ul>
            ) : (
              <p className="px-1 py-6 text-center text-sm text-muted-foreground">
                No projects have been shared with you.
              </p>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <div className="shrink-0 border-t border-border p-3">
        <Button className="w-full" onClick={onCreateProject}>
          <Plus data-icon="inline-start" />
          New Project
        </Button>
      </div>
    </aside>
  );
}
