"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { StarterTemplatesController } from "@/hooks/use-starter-templates";

const StarterTemplatesContext =
  createContext<StarterTemplatesController | null>(null);

interface StarterTemplatesProviderProps {
  starterTemplates: StarterTemplatesController;
  children: ReactNode;
}

/**
 * Shares the one `useStarterTemplates` instance held by the editor shell with the
 * canvas rendered inside it.
 *
 * The picker is opened from the navbar and imported into by the canvas, and those
 * two sit on opposite sides of the shell's `children` boundary: the navbar is the
 * shell's own, while the canvas arrives as the workspace route's server-rendered
 * child. A context is how `code-standards.md` says to bridge that — shared state
 * mounted once in the layout component and passed down — which is the same
 * arrangement `ProjectActionsProvider` already uses for the project dialogs.
 *
 * It carries the open flag only. The import itself is never in here: it needs the
 * room's nodes and edges and the React Flow instance, so it is created inside the
 * canvas and stays there.
 */
export function StarterTemplatesProvider({
  starterTemplates,
  children,
}: StarterTemplatesProviderProps) {
  return (
    <StarterTemplatesContext.Provider value={starterTemplates}>
      {children}
    </StarterTemplatesContext.Provider>
  );
}

export function useStarterTemplatesContext(): StarterTemplatesController {
  const starterTemplates = useContext(StarterTemplatesContext);

  if (!starterTemplates) {
    throw new Error(
      "useStarterTemplatesContext must be used inside a StarterTemplatesProvider."
    );
  }

  return starterTemplates;
}
