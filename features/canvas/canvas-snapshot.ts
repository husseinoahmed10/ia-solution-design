import type { ProjectRoomStorageJson } from "@/liveblocks.config";

/**
 * The canvas snapshot format: what a secondary copy of a project's canvas looks
 * like once it is a file rather than a live document.
 *
 * **Liveblocks Storage remains the authoritative canvas.** A snapshot is a
 * read-only derivative of it, written to Vercel Blob so that recovery, export,
 * standards validation, and AI features have a canvas they can read without
 * joining a room. Nothing loads one back into a room, and `Project.canvasJsonPath`
 * records only where the latest one is.
 *
 * This module is type-and-format only. It touches no provider, so it is safe to
 * import from either side of the network boundary; the reading and writing live in
 * `canvas-snapshot-service.ts`.
 */

/**
 * The format version carried by every snapshot this application writes.
 *
 * It is versioned from the first snapshot rather than from the first change,
 * because a reader added later has to be able to tell what it is holding — and by
 * then the files it must cope with are already written. A reader must check this
 * before interpreting `storage`.
 */
export const CANVAS_SNAPSHOT_VERSION = 1;

/**
 * One captured canvas.
 *
 * `storage` is the Liveblocks Storage tree **verbatim**, so the snapshot holds no
 * second model of a node or an edge and cannot drift from the document it came
 * from. The three fields around it are what a file needs and a live room does not:
 * which format this is, which project it belongs to, and when it was taken.
 *
 * `version` is a `number` rather than the literal `1`, because a reader's job is to
 * branch on it — a snapshot written by an older release is still a valid snapshot.
 *
 * `capturedAt` is an ISO-8601 string rather than a `Date`, since this is the shape
 * that goes through `JSON.stringify` and comes back from a file.
 */
export interface CanvasSnapshot {
  version: number;
  projectId: string;
  capturedAt: string;
  storage: ProjectRoomStorageJson;
}

/**
 * Wraps a room's Storage tree as a snapshot of `projectId`.
 *
 * The timestamp is taken here, at the moment the snapshot is assembled, rather
 * than passed in — it records when the canvas was captured, which is a property of
 * this operation and not of its caller.
 */
export function createCanvasSnapshot(
  projectId: string,
  storage: ProjectRoomStorageJson
): CanvasSnapshot {
  return {
    version: CANVAS_SNAPSHOT_VERSION,
    projectId,
    capturedAt: new Date().toISOString(),
    storage,
  };
}

/**
 * Where a project's latest canvas snapshot lives in the Blob store.
 *
 * A project-specific pathname, so a snapshot is unambiguously associated with its
 * project, and a **stable** one, so each capture replaces the previous file rather
 * than adding one nothing would ever delete. `Project.canvasJsonPath` therefore
 * ends up holding a URL that stays valid across every later snapshot.
 *
 * The project ID must be the one the database returned, not the segment a browser
 * sent, since it is being interpolated into a path.
 */
export function canvasSnapshotPathname(projectId: string): string {
  return `projects/${projectId}/canvas.json`;
}
