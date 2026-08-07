import { checkProjectOwnership } from "@/features/projects/project-access";
import { renameProjectSchema } from "@/features/projects/project-schema";
import {
  deleteProjectForOwner,
  renameProjectForOwner,
} from "@/features/projects/project-service";
import { getRequestUserId } from "@/lib/api-auth";
import { readJsonBody } from "@/lib/api-request";
import {
  badRequestResponse,
  forbiddenResponse,
  notFoundResponse,
  unauthorizedResponse,
} from "@/lib/api-response";
import { deleteProjectRoom } from "@/lib/liveblocks";

/**
 * `PATCH /api/projects/[projectId]` — renames a project.
 *
 * The project ID comes from the URL, so it is caller-supplied and untrusted:
 * ownership is resolved before the update runs and a project owned by another
 * user is a `403`, never a silent no-op.
 */
export async function PATCH(
  request: Request,
  context: RouteContext<"/api/projects/[projectId]">
) {
  const userId = await getRequestUserId();

  if (!userId) {
    return unauthorizedResponse();
  }

  const { projectId } = await context.params;

  const jsonBody = await readJsonBody(request);

  if (!jsonBody.ok) {
    return badRequestResponse("The request body must be valid JSON.");
  }

  const input = renameProjectSchema.safeParse(jsonBody.body);

  if (!input.success) {
    return badRequestResponse(input.error.issues[0].message);
  }

  const ownership = await checkProjectOwnership(projectId, userId);

  if (ownership === "missing") {
    return notFoundResponse();
  }

  if (ownership === "forbidden") {
    return forbiddenResponse();
  }

  const project = await renameProjectForOwner(projectId, userId, input.data.name);

  if (!project) {
    return notFoundResponse();
  }

  return Response.json({ project });
}

/**
 * `DELETE /api/projects/[projectId]` — deletes a project the user owns and the
 * Liveblocks room for its workspace.
 *
 * The room is deleted first: the room ID *is* the project ID, so once the row is
 * gone nothing records which room belonged to it and an orphaned room could never
 * be found again. A failed row delete therefore leaves a project whose room has
 * been removed, which the next create for that ID would recreate — recoverable,
 * unlike a room no identifier points at.
 */
export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/projects/[projectId]">
) {
  const userId = await getRequestUserId();

  if (!userId) {
    return unauthorizedResponse();
  }

  const { projectId } = await context.params;

  const ownership = await checkProjectOwnership(projectId, userId);

  if (ownership === "missing") {
    return notFoundResponse();
  }

  if (ownership === "forbidden") {
    return forbiddenResponse();
  }

  await deleteProjectRoom(projectId);

  const isDeleted = await deleteProjectForOwner(projectId, userId);

  if (!isDeleted) {
    return notFoundResponse();
  }

  return new Response(null, { status: 204 });
}
