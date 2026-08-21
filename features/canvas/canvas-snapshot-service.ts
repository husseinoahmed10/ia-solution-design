import {
  canvasSnapshotPathname,
  createCanvasSnapshot,
} from "@/features/canvas/canvas-snapshot";
import { recordProjectCanvasSnapshot } from "@/features/projects/project-service";
import { uploadJsonBlob } from "@/lib/blob";
import { getProjectRoomStorageJson } from "@/lib/liveblocks";

/**
 * Capturing a project's canvas as a secondary JSON snapshot.
 *
 * Three stores, three responsibilities, and this module is the one place they meet:
 * Liveblocks Storage is the authoritative canvas, Vercel Blob holds the snapshot
 * file, and PostgreSQL holds nothing but a reference to it. Nothing here writes to
 * a room, so a capture cannot change the canvas it is reading.
 */

/**
 * What a capture did. `missing` means the project was gone by the time the
 * reference was written, which a route answers as a `404` rather than a success.
 */
export type CanvasSnapshotOutcome =
  | { status: "captured"; capturedAt: string }
  | { status: "missing" };

/**
 * Captures the current canvas of `projectId` and records where it was stored.
 *
 * `projectId` must be the ID the database returned, not the segment from a request
 * URL: it is both the Liveblocks room to read and part of the Blob pathname to
 * write.
 *
 * The order is deliberate — read, upload, then record. Uploading before the
 * reference is written means `canvasJsonPath` never points at a file that does not
 * exist; the reverse would leave a URL for a snapshot that was never stored. If the
 * project disappears between the caller's access check and the final write, the
 * uploaded file is left behind unreferenced, which is the harmless direction for
 * the pair to fail in.
 *
 * Nothing is retried and nothing is compensated. A capture is a *secondary* copy —
 * the canvas is still in the room, and the next change takes another snapshot — so
 * a failure here loses nothing and is reported rather than worked around.
 */
export async function captureCanvasSnapshot(
  projectId: string
): Promise<CanvasSnapshotOutcome> {
  /*
   * The authoritative canvas, from the room itself. The room ID *is* the project
   * ID, so there is nothing to look up and no mapping that could point at another
   * project's workspace.
   */
  const storage = await getProjectRoomStorageJson(projectId);

  const snapshot = createCanvasSnapshot(projectId, storage);

  const snapshotUrl = await uploadJsonBlob(
    canvasSnapshotPathname(projectId),
    snapshot
  );

  const recorded = await recordProjectCanvasSnapshot(projectId, snapshotUrl);

  if (!recorded) {
    return { status: "missing" };
  }

  return { status: "captured", capturedAt: snapshot.capturedAt };
}
