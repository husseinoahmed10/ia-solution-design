"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { ProjectActionsController } from "@/hooks/use-project-actions";

const ProjectActionsContext = createContext<ProjectActionsController | null>(
  null
);

interface ProjectActionsProviderProps {
  projectActions: ProjectActionsController;
  children: ReactNode;
}

/**
 * Shares the one `useProjectActions` instance held by the editor shell with the
 * screens inside it, so the sidebar and the editor home open the same dialogs
 * rather than each mounting a copy.
 */
export function ProjectActionsProvider({
  projectActions,
  children,
}: ProjectActionsProviderProps) {
  return (
    <ProjectActionsContext.Provider value={projectActions}>
      {children}
    </ProjectActionsContext.Provider>
  );
}

export function useProjectActionsContext(): ProjectActionsController {
  const projectActions = useContext(ProjectActionsContext);

  if (!projectActions) {
    throw new Error(
      "useProjectActionsContext must be used inside a ProjectActionsProvider."
    );
  }

  return projectActions;
}
