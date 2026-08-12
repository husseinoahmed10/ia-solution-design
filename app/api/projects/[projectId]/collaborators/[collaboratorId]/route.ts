import { removeCollaborator } from "@/features/collaborators/collaborator-service";
import { checkProjectOwnership } from "@/features/projects/project-access";
import { getRequestUserId } from "@/lib/api-auth";
import {
  forbiddenResponse,
  notFoundResponse,
  unauthorizedResponse,
} from "@/lib/api-response";

/**
 * `DELETE /api/projects/[projectId]/collaborators/[collaboratorId]` — revokes one
 * collaborator's access.
 *
 * Owner-only: a collaborator has a read-only view of the list and may not remove
 * anyone, including themselves. Ownership is resolved before the delete runs, so a
 * project belonging to another user is a `403` rather than a silent no-op, and the
 * service scopes the statement by owner as well.
 *
 * Both IDs arrive from the URL and are equally untrusted. The collaborator ID is
 * globally unique, so it is matched together with the project ID: a valid ID from
 * a *different* project must not be deletable through this project's route.
 *
 * Removing a collaborator does not revoke their Liveblocks room access, because
 * no room grant is ever issued to one — `createProjectRoom` grants the owner
 * alone. That belongs with the work that lets a collaborator enter the room.
 */
export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/projects/[projectId]/collaborators/[collaboratorId]">
) {
  const userId = await getRequestUserId();

  if (!userId) {
    return unauthorizedResponse();
  }

  const { projectId, collaboratorId } = await context.params;

  const ownership = await checkProjectOwnership(projectId, userId);

  if (ownership === "missing") {
    return notFoundResponse();
  }

  if (ownership === "forbidden") {
    return forbiddenResponse();
  }

  const isRemoved = await removeCollaborator(projectId, userId, collaboratorId);

  if (!isRemoved) {
    return notFoundResponse();
  }

  return new Response(null, { status: 204 });
}
