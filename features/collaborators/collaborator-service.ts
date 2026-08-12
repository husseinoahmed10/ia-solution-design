import { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * A stored collaborator row, before Clerk enrichment. The email is the identity —
 * there is no local user table — and `id` is what a removal addresses, so the
 * client never has to send an email back to delete a row.
 */
export interface CollaboratorRecord {
  id: string;
  email: string;
}

const collaboratorRecordSelect = {
  id: true,
  email: true,
} as const;

/** `@@unique([projectId, email])` — the same address invited twice. */
const UNIQUE_VIOLATION = "P2002";

/** A nested `connect` matched no row, so the scoped project was not there. */
const CONNECTED_RECORD_NOT_FOUND = "P2025";

/**
 * The Prisma error code for a known request error, or `null` for anything else.
 *
 * `Prisma.PrismaClientKnownRequestError` is reached through the `Prisma`
 * namespace, which is what the generated client exports it under — it is not a
 * named export of `client`.
 */
function prismaErrorCode(error: unknown): string | null {
  return error instanceof Prisma.PrismaClientKnownRequestError
    ? error.code
    : null;
}

/**
 * The collaborators on a project, oldest first, so the list does not reorder as
 * invites are added.
 *
 * The caller must already have established that the user may read this project:
 * this function answers *who* has access, not *whether* the asker does.
 */
export async function listCollaborators(
  projectId: string
): Promise<CollaboratorRecord[]> {
  return prisma.projectCollaborator.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
    select: collaboratorRecordSelect,
  });
}

/**
 * The outcome of an invite.
 *
 * `duplicate` is not a failure of the caller's intent — the address already has
 * access — and `missing` means the scoped project was not found, so each maps to a
 * different response.
 */
export type InviteCollaboratorOutcome =
  | { status: "invited"; collaborator: CollaboratorRecord }
  | { status: "duplicate" }
  | { status: "missing" };

/**
 * Invites an email address to a project owned by `ownerId`.
 *
 * The project is reached through a nested `connect` carrying `ownerId` as well as
 * `id`, so the write is scoped by ownership in addition to the caller's prior
 * check: the row cannot be attached to another user's project even if ownership
 * changed in between. A `connect` that matches nothing is `missing` rather than a
 * thrown exception, because the caller has already resolved ownership and so a
 * miss here is a lost race, not an authorisation answer.
 *
 * A second invite for the same address is a `duplicate`. The unique constraint is
 * the authority on that rather than a prior read, so two simultaneous invites
 * cannot both insert.
 */
export async function inviteCollaborator(
  projectId: string,
  ownerId: string,
  email: string
): Promise<InviteCollaboratorOutcome> {
  try {
    const collaborator = await prisma.projectCollaborator.create({
      data: {
        email,
        project: { connect: { id: projectId, ownerId } },
      },
      select: collaboratorRecordSelect,
    });

    return { status: "invited", collaborator };
  } catch (error) {
    const code = prismaErrorCode(error);

    if (code === UNIQUE_VIOLATION) {
      return { status: "duplicate" };
    }

    if (code === CONNECTED_RECORD_NOT_FOUND) {
      return { status: "missing" };
    }

    throw error;
  }
}

/**
 * Removes one collaborator from a project owned by `ownerId`, returning whether a
 * row was removed.
 *
 * The `where` clause carries the collaborator ID, the project ID, **and** the
 * owner, so a collaborator ID belonging to another project — or to a project the
 * caller does not own — cannot be deleted even though the ID alone is unique.
 */
export async function removeCollaborator(
  projectId: string,
  ownerId: string,
  collaboratorId: string
): Promise<boolean> {
  const { count } = await prisma.projectCollaborator.deleteMany({
    where: { id: collaboratorId, projectId, project: { ownerId } },
  });

  return count > 0;
}
