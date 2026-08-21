/**
 * Browser-side call to the canvas snapshot route.
 *
 * It exists so the snapshot hook holds no `fetch`, for the same reason the project
 * and collaborator clients do. What it does *not* do is send a canvas: the request
 * has no body, because the server reads the authoritative one out of the Liveblocks
 * room. A browser's nodes and edges are never the snapshot source.
 */

/**
 * `PUT /api/projects/[projectId]/canvas` — asks the server to snapshot the room's
 * current canvas.
 *
 * A plain `boolean` rather than the `{ ok, error }` shape of the other clients,
 * because the indicator this feeds shows only `Saving…`, `Saved`, or `Save failed`.
 * There is nowhere to render a server message, so reading one would be dead code —
 * and a snapshot is a background copy of a canvas that is already safe in the room,
 * so a failure is worth showing but not worth explaining.
 *
 * A network error is a failed snapshot like any other and is caught here, so an
 * autosave can never surface as an unhandled rejection in an effect.
 */
export async function saveCanvasSnapshot(projectId: string): Promise<boolean> {
  try {
    const response = await fetch(
      `/api/projects/${encodeURIComponent(projectId)}/canvas`,
      { method: "PUT" }
    );

    return response.ok;
  } catch {
    return false;
  }
}
