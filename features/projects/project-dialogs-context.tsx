"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { ProjectDialogsController } from "@/features/projects/use-project-dialogs";

const ProjectDialogsContext = createContext<ProjectDialogsController | null>(
  null
);

interface ProjectDialogsProviderProps {
  dialogs: ProjectDialogsController;
  children: ReactNode;
}

/**
 * Shares the one `useProjectDialogs` instance held by the editor shell with the
 * screens inside it, so the sidebar and the editor home open the same dialogs
 * rather than each mounting a copy.
 */
export function ProjectDialogsProvider({
  dialogs,
  children,
}: ProjectDialogsProviderProps) {
  return (
    <ProjectDialogsContext.Provider value={dialogs}>
      {children}
    </ProjectDialogsContext.Provider>
  );
}

export function useProjectDialogsContext(): ProjectDialogsController {
  const dialogs = useContext(ProjectDialogsContext);

  if (!dialogs) {
    throw new Error(
      "useProjectDialogsContext must be used inside a ProjectDialogsProvider."
    );
  }

  return dialogs;
}
