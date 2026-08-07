import { Liveblocks, LiveblocksError } from "@liveblocks/node";

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

let cachedClient: Liveblocks | null = null;

/**
 * The Liveblocks client, built on first use.
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
    throw new Error(
      "LIVEBLOCKS_SECRET_KEY is not set, so project workspace rooms cannot be managed."
    );
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
