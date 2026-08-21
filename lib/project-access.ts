import {
  findAccessibleProject,
  type ProjectRecord,
} from "@/features/projects/project-service";
import type { ProjectAccess } from "@/features/projects/project-types";
import { getCurrentIdentity } from "@/lib/clerk-identity";

/**
 * What a page should do about a project ID it was handed.
 *
 * `unauthenticated` and `denied` are distinct because they lead to different
 * outcomes — a redirect to sign-in and the `AccessDenied` screen — but a missing
 * project and an inaccessible one deliberately share `denied`, so the route
 * cannot be used to discover that somebody else's project exists.
 */
export type ProjectAccessResult =
  | { status: "unauthenticated" }
  | { status: "denied" }
  | { status: "granted"; project: ProjectRecord; access: ProjectAccess };

/**
 * Resolves whether the current user may open `projectId`.
 *
 * This is the server-side access check for the workspace route
 * (`architecture.md`, invariant 6). A project ID from the URL is
 * caller-supplied, so the project is loaded *through* the check rather than
 * fetched by ID and filtered afterwards.
 *
 * It lives here, outside the page component, so the page holds no access logic
 * of its own and the same decision can be reused by the workspace routes added
 * later. The query itself stays in the project feature module — this composes
 * Clerk identity with it rather than reimplementing it.
 */
export async function resolveProjectAccess(
  projectId: string
): Promise<ProjectAccessResult> {
  const identity = await getCurrentIdentity();

  if (!identity) {
    return { status: "unauthenticated" };
  }

  const accessible = await findAccessibleProject(
    projectId,
    identity.userId,
    identity.primaryEmail
  );

  if (!accessible) {
    return { status: "denied" };
  }

  return { status: "granted", ...accessible };
}
