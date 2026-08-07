import { EditorShell } from "@/components/editor/editor-shell";
import { getProjectLists } from "@/features/projects/project-lists";

/**
 * Wraps every editor route in the shared chrome. The shell is a Client
 * Component because it owns the sidebar open state, but `children` stays a
 * Server Component tree — it is passed through as rendered output.
 *
 * The project lists are fetched here rather than in the sidebar, because the
 * sidebar is a Client Component: this is the closest server boundary above it, so
 * the initial list arrives with the first render and no client-side fetch is
 * needed. A mutation calls `router.refresh()`, which re-runs this layout.
 */
export default async function EditorLayout({ children }: LayoutProps<"/">) {
  const { owned, shared } = await getProjectLists();

  return (
    <EditorShell ownedProjects={owned} sharedProjects={shared}>
      {children}
    </EditorShell>
  );
}
