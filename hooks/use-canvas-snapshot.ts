"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { saveCanvasSnapshot } from "@/features/canvas/canvas-snapshot-client";
import type { CanvasEdge, CanvasNode } from "@/types/canvas";

/**
 * Snapshotting the canvas in the background as it is edited.
 *
 * The hook watches the collaborative nodes and edges and asks the server for a
 * snapshot once they settle. It **sends no canvas**: the request has no body, and
 * the server reads the authoritative document out of the Liveblocks room, so this
 * is a trigger rather than an upload. Nothing here is a second store of the diagram
 * — the arrays it reads are the ones `useLiveblocksFlow` already owns, and the only
 * state it keeps is which snapshot request is in flight.
 */

/**
 * How long the canvas must be still before a snapshot is taken.
 *
 * Long enough to cover a drag, a burst of typing in a label, or a template import —
 * each of which is many changes arriving in quick succession — and short enough that
 * somebody who stops editing sees `Saved` while they are still looking at the canvas.
 */
const SNAPSHOT_DEBOUNCE_MS = 1500;

/**
 * What the indicator is showing. `idle` is a canvas nobody has changed this
 * session, which renders nothing at all rather than a reassurance about a snapshot
 * that was never needed.
 *
 * This is **local UI state**. It is not presence and never reaches Storage, so it
 * says what *this* browser's autosave is doing and is not shared with the room.
 */
export type CanvasSnapshotStatus = "idle" | "saving" | "saved" | "error";

interface UseCanvasSnapshotOptions {
  /** The open project, which is also its Liveblocks room. */
  projectId: string;
  /** The room's nodes, straight from `useLiveblocksFlow`. */
  nodes: CanvasNode[];
  /** The room's edges, straight from `useLiveblocksFlow`. */
  edges: CanvasEdge[];
}

/**
 * A string that changes when the **document** changes, and not otherwise.
 *
 * The arrays themselves cannot be the trigger: React Flow hands back new array and
 * node identities on renders that changed nothing about the diagram, and a snapshot
 * that also re-renders this component — `saving` to `saved` — would then see fresh
 * identities, fire again, and never stop.
 *
 * So only the fields that belong to the diagram are read. React Flow's transient
 * per-viewer fields are deliberately absent: `selected`, `dragging`, and `measured`
 * describe what one person is doing to their own view, so clicking a component or
 * hovering it must not spend a snapshot. `position` *is* included, because moving a
 * component is an edit — the intermediate positions of a drag are simply absorbed by
 * the debounce.
 *
 * It is one `JSON.stringify` of nested arrays rather than joined fields, so a node
 * label — arbitrary user text — cannot be mistaken for a separator: two components
 * called `a` and `b` must not signature the same as one called `a,b`.
 */
function canvasSignature(nodes: CanvasNode[], edges: CanvasEdge[]): string {
  return JSON.stringify([
    nodes.map((node) => [
      node.id,
      node.type,
      node.position.x,
      node.position.y,
      node.width,
      node.height,
      /*
       * The whole `data` object, so a field added to `CanvasNodeData` later is
       * covered without reopening this.
       */
      node.data,
    ]),
    edges.map((edge) => [
      edge.id,
      edge.source,
      edge.target,
      edge.sourceHandle,
      edge.targetHandle,
      edge.type,
      edge.data,
    ]),
  ]);
}

/**
 * Keeps a project's canvas snapshot up to date and reports what the autosave is
 * doing.
 *
 * It must be mounted inside the room, below the component that calls
 * `useLiveblocksFlow`, since that is where the collaborative arrays exist.
 *
 * **Nothing is snapshotted on mount.** Opening a project is not a change to it, and
 * a snapshot per page view would rewrite the stored file — and show `Saving…` — for
 * a canvas nobody had touched. The first snapshot of a session is therefore the
 * consequence of the first edit.
 *
 * A snapshot is not written back into the room and this hook never restores one, so
 * an empty canvas stays empty: it is valid state, not missing data.
 */
export function useCanvasSnapshot({
  projectId,
  nodes,
  edges,
}: UseCanvasSnapshotOptions): CanvasSnapshotStatus {
  const [status, setStatus] = useState<CanvasSnapshotStatus>("idle");

  const signature = useMemo(
    () => canvasSignature(nodes, edges),
    [nodes, edges]
  );

  /*
   * The canvas as it was when a snapshot was last *started*, and which project that
   * was. Storing the project alongside it is what makes navigating between two
   * workspaces behave like a first mount rather than like an enormous edit.
   */
  const captured = useRef<{ projectId: string; signature: string } | null>(
    null
  );

  /*
   * Which snapshot request is the current one. Requests are debounced but not
   * serialised, so a slow one can still land after a later one — this is how its
   * answer is discarded instead of overwriting a fresher status.
   */
  const requestId = useRef(0);

  useEffect(() => {
    const previous = captured.current;

    /*
     * First sight of this canvas — the initial mount, or the first render after
     * moving to another project. The signature is recorded as the baseline and
     * nothing is sent, so only a change from *here* counts as an edit.
     */
    if (!previous || previous.projectId !== projectId) {
      captured.current = { projectId, signature };
      setStatus("idle");
      return;
    }

    /* A render that changed nothing about the diagram. */
    if (previous.signature === signature) {
      return;
    }

    const timer = window.setTimeout(() => {
      /*
       * The baseline moves when the request *starts*, not when it succeeds. A failed
       * snapshot is therefore left alone until the canvas changes again, rather than
       * being retried on every subsequent render against a server that is still
       * failing — the canvas is safe in the room meanwhile, which is what makes that
       * the right trade.
       */
      captured.current = { projectId, signature };

      requestId.current += 1;
      const id = requestId.current;

      setStatus("saving");

      void saveCanvasSnapshot(projectId).then((ok) => {
        if (id !== requestId.current) {
          return;
        }

        setStatus(ok ? "saved" : "error");
      });
    }, SNAPSHOT_DEBOUNCE_MS);

    /*
     * The next change cancels the pending snapshot, which is the debounce: a canvas
     * being actively edited produces one request when the editing stops, not one per
     * change.
     */
    return () => window.clearTimeout(timer);
  }, [projectId, signature]);

  return status;
}
