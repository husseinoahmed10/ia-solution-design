import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

import { findAccessibleProject } from "@/features/projects/project-service";

/**
 * A project workspace.
 *
 * This unit only wires the sidebar and the dialogs, so the canvas itself is not
 * built here — the route exists because creating a project navigates to it, and
 * it establishes where the workspace's server-side access check lives.
 *
 * `projectId` arrives from the URL, so it is caller-supplied and untrusted: the
 * project is loaded through an access check rather than fetched by ID
 * (`architecture.md`, invariant 6). A project that does not exist and one the
 * user may not open are both a `404`, so the page cannot be used to discover that
 * somebody else's project exists.
 */
export default async function ProjectWorkspacePage({
  params,
}: PageProps<"/editor/[projectId]">) {
  const { projectId } = await params;
  const user = await currentUser();

  if (!user) {
    notFound();
  }

  const accessible = await findAccessibleProject(
    projectId,
    user.id,
    user.primaryEmailAddress?.emailAddress ?? null
  );

  if (!accessible) {
    notFound();
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-3xl font-semibold tracking-tight text-balance">
        {accessible.project.name}
      </h1>
      <p className="max-w-md text-sm leading-relaxed text-pretty text-muted-foreground">
        This workspace is ready. The architecture canvas arrives in a later unit.
      </p>
    </div>
  );
}
