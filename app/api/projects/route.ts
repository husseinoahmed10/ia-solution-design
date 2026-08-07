import { createProjectSchema } from "@/features/projects/project-schema";
import {
  createProjectForOwner,
  deleteProjectForOwner,
  listProjectsForOwner,
} from "@/features/projects/project-service";
import { getRequestUserId } from "@/lib/api-auth";
import { readJsonBody } from "@/lib/api-request";
import { badRequestResponse, unauthorizedResponse } from "@/lib/api-response";
import { createProjectRoom } from "@/lib/liveblocks";

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
    await deleteProjectForOwner(project.id, userId);

    throw error;
  }

  return Response.json({ project }, { status: 201 });
}
