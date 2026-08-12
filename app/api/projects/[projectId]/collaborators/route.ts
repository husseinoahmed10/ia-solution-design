import { inviteCollaboratorSchema } from "@/features/collaborators/collaborator-schema";
import {
  inviteCollaborator,
  listCollaborators,
} from "@/features/collaborators/collaborator-service";
import { toCollaboratorSummaries } from "@/features/collaborators/collaborator-summary";
import type { CollaboratorListResponse } from "@/features/collaborators/collaborator-types";
import { checkProjectOwnership } from "@/features/projects/project-access";
import { readJsonBody } from "@/lib/api-request";
import {
  badRequestResponse,
  conflictResponse,
  forbiddenResponse,
  notFoundResponse,
  unauthorizedResponse,
} from "@/lib/api-response";
import { getCurrentIdentity } from "@/lib/clerk-identity";
import { resolveProjectAccess } from "@/lib/project-access";

/**
 * `GET /api/projects/[projectId]/collaborators` — who has access to a project.
 *
 * Readable by an owner **and** by a collaborator, because the specification gives
 * a collaborator a read-only view of the list, so this uses the shared
 * `resolveProjectAccess` check rather than the owner-only one. It answers `404`
 * for a project that is missing *or* inaccessible: `resolveProjectAccess`
 * deliberately collapses the two, so distinguishing them here would reveal that
 * another user's project exists.
 *
 * `canManage` tells the client whether to render the invite and remove controls.
 * It is an affordance only — `POST` and `DELETE` each enforce ownership
 * themselves.
 */
export async function GET(
  _request: Request,
  context: RouteContext<"/api/projects/[projectId]/collaborators">
) {
  const { projectId } = await context.params;

  const access = await resolveProjectAccess(projectId);

  if (access.status === "unauthenticated") {
    return unauthorizedResponse();
  }

  if (access.status === "denied") {
    return notFoundResponse();
  }

  const collaborators = await toCollaboratorSummaries(
    await listCollaborators(projectId)
  );

  return Response.json({
    collaborators,
    canManage: access.access === "owner",
  } satisfies CollaboratorListResponse);
}

/**
 * `POST /api/projects/[projectId]/collaborators` — invites an email address.
 *
 * Owner-only, so this uses `checkProjectOwnership` rather than the page-level
 * check: a mutation must answer `403` for somebody else's project and `404` for
 * one that does not exist.
 *
 * Inviting an address that already has access is a `409`, not a silent success,
 * so the dialog can say why nothing was added. The address is lower-cased by the
 * schema, so a re-invite differing only in case is caught as the duplicate it is.
 */
export async function POST(
  request: Request,
  context: RouteContext<"/api/projects/[projectId]/collaborators">
) {
  const identity = await getCurrentIdentity();

  if (!identity) {
    return unauthorizedResponse();
  }

  const { projectId } = await context.params;

  const jsonBody = await readJsonBody(request);

  if (!jsonBody.ok) {
    return badRequestResponse("The request body must be valid JSON.");
  }

  const input = inviteCollaboratorSchema.safeParse(jsonBody.body);

  if (!input.success) {
    return badRequestResponse(input.error.issues[0].message);
  }

  const ownership = await checkProjectOwnership(projectId, identity.userId);

  if (ownership === "missing") {
    return notFoundResponse();
  }

  if (ownership === "forbidden") {
    return forbiddenResponse();
  }

  /*
   * An owner inviting themselves would create a collaborator row for the person
   * who already has full access, which the sidebar would then list under both
   * `My Projects` and `Shared`.
   */
  if (input.data.email === identity.primaryEmail) {
    return conflictResponse("You already own this project.");
  }

  const outcome = await inviteCollaborator(
    projectId,
    identity.userId,
    input.data.email
  );

  if (outcome.status === "missing") {
    return notFoundResponse();
  }

  if (outcome.status === "duplicate") {
    return conflictResponse("That person already has access to this project.");
  }

  const [collaborator] = await toCollaboratorSummaries([outcome.collaborator]);

  return Response.json({ collaborator }, { status: 201 });
}
