import { createProjectSchema } from "@/features/projects/project-schema";
import {
  createProjectForOwner,
  deleteProjectForOwner,
  listProjectsForOwner,
} from "@/features/projects/project-service";
import { getRequestUserId } from "@/lib/api-auth";
import { readJsonBody } from "@/lib/api-request";
import { badRequestResponse, unauthorizedResponse } from "@/lib/api-response";
import { createProjectRoom, deleteProjectRoom } from "@/lib/liveblocks";

/** `GET /api/projects` — the signed-in user's own projects, newest first. */
export async function GET() {
  const userId = await getRequestUserId();

  if (!userId) {
    return unauthorizedResponse();
  }

  const projects = await listProjectsForOwner(userId);

  return Response.json({ projects });
}

/**
 * `POST /api/projects` — creates a project owned by the signed-in user, and the
 * Liveblocks room for its workspace.
 *
 * A missing or blank name becomes `Untitled Project`; the schema applies that,
 * so it is not repeated here.
 *
 * The project row is written first, because its `@default(uuid(7))` ID is what
 * names the room — the two therefore always share one identifier, and no ID is
 * derived from the project name. If the room cannot be created the project is
 * deleted again, so the response never reports a workspace the user could not
 * open. That ordering makes an orphaned *row* impossible; the reverse order would
 * leave an orphaned *room*, which nothing in the application would ever revisit.
 *
 * A failed create is *ambiguous*: a timeout or a dropped response can mean the
 * room was made and only the acknowledgement was lost. The compensation therefore
 * deletes the room before the row, in that order and for the same reason `DELETE`
 * does — the room ID is the project ID, so while the row still exists the room is
 * addressable, and once the row is gone it never is again. `deleteProjectRoom`
 * treats a `404` as success, so this is safe when no room was in fact created and
 * needs no durable cleanup state. A room delete that also fails is the one case
 * that can still strand a room: the row is then deliberately *kept*, so the ID
 * that names the room is not lost and the next `DELETE` retries the pair.
 */
export async function POST(request: Request) {
  const userId = await getRequestUserId();

  if (!userId) {
    return unauthorizedResponse();
  }

  const jsonBody = await readJsonBody(request);

  if (!jsonBody.ok) {
    return badRequestResponse("The request body must be valid JSON.");
  }

  const input = createProjectSchema.safeParse(jsonBody.body);

  if (!input.success) {
    return badRequestResponse(input.error.issues[0].message);
  }

  const project = await createProjectForOwner(userId, input.data.name);

  try {
    await createProjectRoom(project.id, userId);
  } catch (error) {
    /*
     * Order matters, and so does what happens when the cleanup itself fails: the
     * row is dropped *only* once the room is known to be gone. A room delete that
     * throws therefore leaves the row in place on purpose — the ID still names the
     * room, so a later `DELETE` can retry both halves — and it is swallowed rather
     * than propagated, so the original failure is what the caller sees instead of
     * a cleanup error that would mask the reason the create failed.
     */
    try {
      await deleteProjectRoom(project.id);
      await deleteProjectForOwner(project.id, userId);
    } catch {}

    throw error;
  }

  return Response.json({ project }, { status: 201 });
}
