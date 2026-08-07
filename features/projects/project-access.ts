import { prisma } from "@/lib/prisma";

/**
 * The outcome of an ownership check. `missing` and `forbidden` are kept apart
 * because they map to different status codes: a project that does not exist is
 * a `404`, while one owned by somebody else is a `403`.
 */
export type ProjectOwnershipOutcome = "owner" | "forbidden" | "missing";

/**
 * Resolves whether `userId` owns `projectId`.
 *
 * This is the server-side access check required at every project mutation
 * boundary (`architecture.md`, invariant 6). A project ID arriving in the URL is
 * caller-supplied, so nothing may act on it before this has answered.
 *
 * It reads only `ownerId`: the caller may not be entitled to the rest of the
 * record, and the decision needs nothing else.
 */
export async function checkProjectOwnership(
  projectId: string,
  userId: string
): Promise<ProjectOwnershipOutcome> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });

  if (!project) {
    return "missing";
  }

  return project.ownerId === userId ? "owner" : "forbidden";
}
