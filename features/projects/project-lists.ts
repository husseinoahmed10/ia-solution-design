import {
  listProjectsForCollaborator,
  listProjectsForOwner,
} from "@/features/projects/project-service";
import { toProjectSummary } from "@/features/projects/project-summary";
import type { ProjectSummary } from "@/features/projects/project-types";
import { getCurrentIdentity } from "@/lib/clerk-identity";

export interface ProjectLists {
  owned: ProjectSummary[];
  shared: ProjectSummary[];
}

const EMPTY_LISTS: ProjectLists = { owned: [], shared: [] };

/**
 * The signed-in user's owned and shared projects, for the initial server render
 * of the sidebar.
 *
 * It reads the session itself rather than taking a user ID, so the caller cannot
 * pass somebody else's — the lists are always the current user's, which is the
 * server-side access check for this read (`architecture.md`, invariant 6).
 *
 * `getCurrentIdentity()` reads `currentUser()` rather than `auth()` because a
 * collaborator is identified by email address, and only the full user carries
 * one. It is also where the address is lower-cased, so it matches the
 * `ProjectCollaborator` rows an invite stored. Clerk dedupes the call per
 * request, so reading it here as well as in `resolveProjectAccess()` is a single
 * Backend API call.
 *
 * The two queries run together: neither depends on the other, so awaiting them in
 * sequence would only add latency.
 */
export async function getProjectLists(): Promise<ProjectLists> {
  const identity = await getCurrentIdentity();

  if (!identity) {
    return EMPTY_LISTS;
  }

  const { userId, primaryEmail } = identity;

  const [ownedProjects, sharedProjects] = await Promise.all([
    listProjectsForOwner(userId),
    primaryEmail
      ? listProjectsForCollaborator(primaryEmail)
      : Promise.resolve([]),
  ]);

  return {
    owned: ownedProjects.map((project) => toProjectSummary(project, "owner")),
    shared: sharedProjects.map((project) =>
      toProjectSummary(project, "collaborator")
    ),
  };
}
