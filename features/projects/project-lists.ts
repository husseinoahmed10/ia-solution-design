import { currentUser } from "@clerk/nextjs/server";

import {
  listProjectsForCollaborator,
  listProjectsForOwner,
} from "@/features/projects/project-service";
import { toProjectSummary } from "@/features/projects/project-summary";
import type { ProjectSummary } from "@/features/projects/project-types";

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
 * `currentUser()` is used rather than `auth()` because a collaborator is
 * identified by email address, and only the full user carries one. Clerk dedupes
 * it per request, so calling this from more than one component in a render is
 * a single Backend API call.
 *
 * The two queries run together: neither depends on the other, so awaiting them in
 * sequence would only add latency.
 */
export async function getProjectLists(): Promise<ProjectLists> {
  const user = await currentUser();

  if (!user) {
    return EMPTY_LISTS;
  }

  const email = user.primaryEmailAddress?.emailAddress ?? null;

  const [ownedProjects, sharedProjects] = await Promise.all([
    listProjectsForOwner(user.id),
    email ? listProjectsForCollaborator(email) : Promise.resolve([]),
  ]);

  return {
    owned: ownedProjects.map((project) => toProjectSummary(project, "owner")),
    shared: sharedProjects.map((project) =>
      toProjectSummary(project, "collaborator")
    ),
  };
}
