import type { ProjectStatus } from "@/app/generated/prisma/enums";
import type { ProjectAccess } from "@/features/projects/project-types";
import { prisma } from "@/lib/prisma";

/**
 * The project fields the API returns. `ownerId` and `canvasJsonPath` are
 * deliberately absent: the first is always the caller and the second is an
 * internal blob path, so neither belongs in a response.
 */
export interface ProjectRecord {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
}

const projectRecordSelect = {
  id: true,
  name: true,
  description: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const;

/**
 * The projects owned by one Clerk user, newest first.
 *
 * `ownerId` is part of the query rather than a filter applied afterwards, so a
 * project belonging to somebody else can never reach the response. Collaborator
 * access is not part of this unit — only owned projects are listed.
 */
export async function listProjectsForOwner(ownerId: string): Promise<ProjectRecord[]> {
  return prisma.project.findMany({
    where: { ownerId },
    orderBy: { createdAt: "desc" },
    select: projectRecordSelect,
  });
}

/**
 * The projects shared with one user, newest first.
 *
 * A collaborator is identified by email rather than by a Clerk user ID, because
 * they may have been invited before signing up, so this is the only way to reach
 * a project the user does not own. The select list is the same as an owner's, so
 * a shared project exposes no more than an owned one.
 */
export async function listProjectsForCollaborator(
  email: string
): Promise<ProjectRecord[]> {
  return prisma.project.findMany({
    where: { collaborators: { some: { email } } },
    orderBy: { createdAt: "desc" },
    select: projectRecordSelect,
  });
}

/**
 * One project the user may open, with how they reach it — or `null` when the
 * project does not exist or is neither owned by nor shared with them.
 *
 * This is the server-side access check for the workspace route (invariant 6).
 * The `OR` is inside the query rather than applied to the result, so a project
 * the user cannot reach is never loaded. A missing project and an inaccessible
 * one both answer `null`: the page renders a 404 for either, so telling them
 * apart would only reveal that somebody else's project exists.
 */
export async function findAccessibleProject(
  projectId: string,
  userId: string,
  email: string | null
): Promise<{ project: ProjectRecord; access: ProjectAccess } | null> {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { ownerId: userId },
        ...(email ? [{ collaborators: { some: { email } } }] : []),
      ],
    },
    select: { ...projectRecordSelect, ownerId: true },
  });

  if (!project) {
    return null;
  }

  const { ownerId, ...record } = project;

  return {
    project: record,
    access: ownerId === userId ? "owner" : "collaborator",
  };
}

/**
 * Creates a project owned by `ownerId`. The ID comes from the schema's
 * `@default(uuid(7))`, so nothing is generated here and there is no sequence.
 */
export async function createProjectForOwner(
  ownerId: string,
  name: string
): Promise<ProjectRecord> {
  return prisma.project.create({
    data: { ownerId, name },
    select: projectRecordSelect,
  });
}

/**
 * Renames a project.
 *
 * `ownerId` is in the `where` clause as well as being checked beforehand, so the
 * statement itself cannot touch another user's project even if ownership changed
 * between the check and this call. The caller has already resolved ownership, so
 * a zero-row result here is a lost race rather than an authorisation answer.
 */
export async function renameProjectForOwner(
  projectId: string,
  ownerId: string,
  name: string
): Promise<ProjectRecord | null> {
  const renamed = await prisma.project.updateManyAndReturn({
    where: { id: projectId, ownerId },
    data: { name },
    select: projectRecordSelect,
  });

  return renamed[0] ?? null;
}

/**
 * Records where a project's latest canvas snapshot is.
 *
 * `canvasJsonPath` is the only field written, and it is a **reference** rather than
 * canvas data: the canvas itself stays in Liveblocks Storage and in the Blob file
 * this URL points at, so PostgreSQL gains no copy of the diagram.
 *
 * Unlike the rename and the delete, this is **not** scoped to an owner — a
 * collaborator editing the canvas is also snapshotting it, and their access has
 * already been resolved by the caller (invariant 6). It is an `updateMany` rather
 * than an `update` so that a project deleted between that check and this write is a
 * zero-row result the caller can report, not a thrown exception.
 */
export async function recordProjectCanvasSnapshot(
  projectId: string,
  canvasJsonPath: string
): Promise<boolean> {
  const { count } = await prisma.project.updateMany({
    where: { id: projectId },
    data: { canvasJsonPath },
  });

  return count > 0;
}

/**
 * Deletes a project, scoped to its owner for the same reason as the rename.
 * Collaborator rows go with it through the schema's `onDelete: Cascade`.
 *
 * Returns whether a row was removed.
 */
export async function deleteProjectForOwner(
  projectId: string,
  ownerId: string
): Promise<boolean> {
  const { count } = await prisma.project.deleteMany({
    where: { id: projectId, ownerId },
  });

  return count > 0;
}
