import { Liveblocks, LiveblocksError } from "@liveblocks/node";

import type { ProjectUserInfo } from "@/liveblocks.config";

/**
 * The Liveblocks room behind a project workspace.
 *
 * A room ID is *always* the project ID, so the project, its workspace route, and
 * its room share one identifier and cannot drift apart. Nothing here derives an
 * ID from a project name or adds a unique suffix — a rename must therefore leave
 * the room untouched, which is why there is no rename operation in this module.
 *
 * Liveblocks is reached only through this adapter, per `architecture.md`, so the
 * provider can be replaced without touching the routes or the services.
 */

/**
 * `LIVEBLOCKS_SECRET_KEY` is absent, so no Liveblocks call can be made.
 *
 * A distinct type rather than a bare `Error`, so a caller can tell a
 * *deployment* fault — nothing the request did wrong, and nothing a retry fixes —
 * apart from a Liveblocks API failure, and answer with a configuration error
 * instead of masking it as a refusal or a missing room.
 */
export class LiveblocksNotConfiguredError extends Error {
  constructor() {
    super(
      "LIVEBLOCKS_SECRET_KEY is not set, so project workspace rooms cannot be managed."
    );

    this.name = "LiveblocksNotConfiguredError";
  }
}

let cachedClient: Liveblocks | null = null;

/**
 * The Liveblocks client, built on first use and cached for the lifetime of the
 * server process.
 *
 * The secret is read here rather than at module scope so importing this file
 * never throws: `next build` loads the route handlers without any runtime
 * environment, and a missing key must fail the request that needs it rather
 * than the build.
 */
function getLiveblocksClient(): Liveblocks {
  if (cachedClient) {
    return cachedClient;
  }

  const secret = process.env.LIVEBLOCKS_SECRET_KEY;

  if (!secret) {
    throw new LiveblocksNotConfiguredError();
  }

  const baseUrl = process.env.LIVEBLOCKS_BASE_URL;

  cachedClient = new Liveblocks({
    secret,
    ...(baseUrl ? { baseUrl } : {}),
  });

  return cachedClient;
}

function statusOf(error: unknown): number | null {
  return error instanceof LiveblocksError ? error.status : null;
}

/**
 * Creates the room for a project workspace, keyed by the project ID.
 *
 * The room is private: `defaultAccesses` is empty, so access comes only from the
 * explicit grant to the owner. A room that already exists (`409`) is treated as
 * success, so a retried create cannot fail on its second attempt.
 */
export async function createProjectRoom(
  projectId: string,
  ownerId: string
): Promise<void> {
  try {
    await getLiveblocksClient().createRoom(projectId, {
      defaultAccesses: [],
      usersAccesses: { [ownerId]: ["room:write"] },
    });
  } catch (error) {
    if (statusOf(error) === 409) {
      return;
    }

    throw error;
  }
}

/**
 * Deletes the room for a project workspace.
 *
 * A room that is already gone (`404`) is treated as success: the caller's intent
 * is that no room remains, and a project created before rooms existed has none
 * to remove.
 */
export async function deleteProjectRoom(projectId: string): Promise<void> {
  try {
    await getLiveblocksClient().deleteRoom(projectId);
  } catch (error) {
    if (statusOf(error) === 404) {
      return;
    }

    throw error;
  }
}

/**
 * Makes sure the room for a project workspace exists, creating it only if it does
 * not.
 *
 * `getOrCreateRoom` is one request that returns the existing room untouched, so a
 * project created before its room existed — or one whose room was created and then
 * lost — heals on the next authentication instead of failing forever. It cannot
 * overwrite an existing room's permissions: the options apply only when the room
 * is created.
 *
 * A new room is **private**: `defaultAccesses` is empty, so nobody reaches it by
 * default. No `usersAccesses` is set here on purpose — access to a workspace is
 * granted per session by `authorizeProjectRoomSession`, which is resolved against
 * this application's own access check on every connection. Baking a grant into the
 * room would mean a collaborator whose access was revoked kept a permission this
 * application no longer believes in.
 */
export async function ensureProjectRoom(projectId: string): Promise<void> {
  await getLiveblocksClient().getOrCreateRoom(projectId, {
    defaultAccesses: [],
  });
}

/**
 * Opens a Liveblocks session for one user on one project workspace.
 *
 * The session is identified by the **Clerk user ID**, so a presence in a room
 * traces back to a Clerk user, and `userInfo` is attached here — on the server,
 * from the authenticated session — so a client cannot claim another name, avatar,
 * or colour.
 *
 * The grant is `projectId` **exactly**: no trailing `*`, so the token authorises
 * the one room the caller was checked against and nothing else. A pattern such as
 * `` `${projectId}*` `` or a shared prefix would hand out access to other
 * projects' workspaces, which is precisely what the per-request access check
 * exists to prevent.
 *
 * The caller is responsible for having authorised the user for this project
 * first — this function grants, it does not decide.
 */
export async function authorizeProjectRoomSession(
  projectId: string,
  userId: string,
  userInfo: ProjectUserInfo
): Promise<{ status: number; body: string }> {
  const session = getLiveblocksClient().prepareSession(userId, { userInfo });

  session.allow(projectId, ["*:write"]);

  const { status, body } = await session.authorize();

  return { status, body };
}
