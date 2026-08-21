import { captureCanvasSnapshot } from "@/features/canvas/canvas-snapshot-service";
import {
  configurationErrorResponse,
  notFoundResponse,
  unauthorizedResponse,
} from "@/lib/api-response";
import { BlobNotConfiguredError } from "@/lib/blob";
import { LiveblocksNotConfiguredError } from "@/lib/liveblocks";
import { resolveProjectAccess } from "@/lib/project-access";

/**
 * `PUT /api/projects/[projectId]/canvas` — captures a secondary JSON snapshot of a
 * project's canvas.
 *
 * **The request carries no canvas.** It takes no body at all, and deliberately: the
 * authoritative canvas is Liveblocks Storage, so the snapshot is read from the room
 * server-side rather than accepted from the caller. Nodes and edges sent by a
 * browser would be one participant's view of a document several people are writing,
 * and trusting them would make the client a second source of truth for the diagram.
 * The only thing this route needs from the request is *which project*.
 *
 * A `PUT` rather than a `POST`, because the effect is idempotent: a capture replaces
 * the project's snapshot file and its `canvasJsonPath`, so calling it twice leaves
 * the same state as calling it once.
 *
 * Writable by an **owner or a collaborator** — both may edit the canvas, so both
 * snapshot it — which is why this uses the shared `resolveProjectAccess` check
 * rather than the owner-only one (invariant 6). That check deliberately collapses a
 * missing project and an inaccessible one, so `404` is the only honest answer for
 * either: telling them apart would confirm that another user's project exists.
 *
 * The response says when the snapshot was taken and nothing else. **The Blob URL is
 * not returned**, since the client has no use for it and it addresses a private file
 * this server reads on the caller's behalf.
 */
export async function PUT(
  _request: Request,
  context: RouteContext<"/api/projects/[projectId]/canvas">
) {
  const { projectId } = await context.params;

  const access = await resolveProjectAccess(projectId);

  if (access.status === "unauthenticated") {
    return unauthorizedResponse();
  }

  if (access.status === "denied") {
    return notFoundResponse();
  }

  try {
    /*
     * The project's **own** ID from the database rather than the URL segment. They
     * are the same value once the check above has passed, and using the resolved one
     * is what keeps a caller-supplied string out of a Blob pathname.
     */
    const outcome = await captureCanvasSnapshot(access.project.id);

    /* Deleted between the access check and the write. */
    if (outcome.status === "missing") {
      return notFoundResponse();
    }

    return Response.json({ capturedAt: outcome.capturedAt });
  } catch (error) {
    /*
     * A deployment that is missing a credential, not a request that did anything
     * wrong — so a `500` through the shared helper, with a message naming what is not
     * configured rather than a stack trace. Both stores are named separately because
     * they are configured separately.
     */
    if (error instanceof BlobNotConfiguredError) {
      return configurationErrorResponse(
        "Canvas snapshot storage is not configured on this server."
      );
    }

    if (error instanceof LiveblocksNotConfiguredError) {
      return configurationErrorResponse(
        "Realtime collaboration is not configured on this server."
      );
    }

    throw error;
  }
}
