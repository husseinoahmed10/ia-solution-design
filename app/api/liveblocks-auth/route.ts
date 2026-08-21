import { liveblocksAuthSchema } from "@/features/collaboration/liveblocks-auth-schema";
import { getRequestUserId } from "@/lib/api-auth";
import { readJsonBody } from "@/lib/api-request";
import {
  badRequestResponse,
  configurationErrorResponse,
  forbiddenResponse,
  unauthorizedResponse,
} from "@/lib/api-response";
import { getCurrentUserProfile } from "@/lib/clerk-users";
import {
  authorizeProjectRoomSession,
  ensureProjectRoom,
  LiveblocksNotConfiguredError,
} from "@/lib/liveblocks";
import { cursorColorForUserId } from "@/lib/liveblocks-cursor-color";
import { resolveProjectAccess } from "@/lib/project-access";

/**
 * `POST /api/liveblocks-auth` — authenticates a browser into one project's
 * Liveblocks room.
 *
 * This is the room authentication endpoint the Liveblocks client calls with the
 * room it wants to join. A room ID **is** a project ID, and it arrives from the
 * browser, so it is untrusted: access is resolved through this application's own
 * check (`resolveProjectAccess`, invariant 6) before any token is minted. An owner
 * and a collaborator both pass; anybody else is refused.
 *
 * The token grants write access to **that project's room alone** — no wildcard and
 * no shared prefix — so a session for one workspace can never be used to enter
 * another IA Solution Design project.
 *
 * The identity on the session is the Clerk user ID, and the name, avatar, and
 * colour are attached here rather than sent by the client, so a user cannot
 * present themselves to a room as somebody else.
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

  const input = liveblocksAuthSchema.safeParse(jsonBody.body);

  if (!input.success) {
    return badRequestResponse(input.error.issues[0].message);
  }

  /* The room the client asked for. The same value as the project it belongs to. */
  const projectId = input.data.room;

  const access = await resolveProjectAccess(projectId);

  if (access.status === "unauthenticated") {
    return unauthorizedResponse();
  }

  /*
   * `resolveProjectAccess` collapses a missing project and an inaccessible one, and
   * both answer `403` here. That is the right code for this endpoint even though a
   * page renders one screen for both outcomes: the caller is asking to be
   * *authorised*, and it is not authorised either way. A `404` for a project that
   * does not exist would additionally tell an unauthorised caller which IDs are
   * real.
   */
  if (access.status === "denied") {
    return forbiddenResponse();
  }

  const profile = await getCurrentUserProfile();

  if (!profile) {
    return unauthorizedResponse();
  }

  try {
    /*
     * The room is ensured rather than assumed. A project created while Liveblocks
     * was unreachable has a row but no room, so this heals that case without a
     * migration — and `getOrCreateRoom` leaves an existing room and its permissions
     * untouched, so it cannot weaken a room that is already there.
     */
    await ensureProjectRoom(projectId);

    /*
     * `avatar` is spread in only when there is one, rather than set to `null`:
     * Liveblocks constrains the field to `string | undefined`, and an absent key is
     * how "this user has no image" is expressed.
     */
    const { status, body } = await authorizeProjectRoomSession(projectId, userId, {
      name: profile.displayName,
      ...(profile.imageUrl ? { avatar: profile.imageUrl } : {}),
      color: cursorColorForUserId(userId),
    });

    /*
     * Liveblocks' own status and body are returned verbatim, which is what its
     * client expects: it reads the token out of the body and reports a failure
     * itself when the status is not a success.
     */
    return new Response(body, { status });
  } catch (error) {
    if (error instanceof LiveblocksNotConfiguredError) {
      return configurationErrorResponse(
        "Realtime collaboration is not configured on this server."
      );
    }

    throw error;
  }
}
