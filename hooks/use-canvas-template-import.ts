"use client";

import { useHistory } from "@liveblocks/react/suspense";
import {
  useReactFlow,
  type OnDelete,
  type OnEdgesChange,
  type OnNodesChange,
} from "@xyflow/react";
import { useCallback, useEffect, useRef } from "react";

import {
  CANVAS_VIEWPORT_ANIMATION_DURATION,
  canvasFitViewOptions,
} from "@/features/canvas/canvas-control-tokens";
import { createCanvasTemplateInstance } from "@/features/canvas/canvas-template-import";
import type { CanvasTemplate } from "@/features/canvas/starter-templates";
import type { CanvasEdge, CanvasNode } from "@/types/canvas";

interface UseCanvasTemplateImportOptions {
  /**
   * The room's current nodes and edges — what the import replaces. They come from
   * `useLiveblocksFlow`, so this is the collaborative document rather than a copy of
   * it, and passing them in is what keeps this hook free of any state of its own.
   */
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  /** The Liveblocks mutations, straight from `useLiveblocksFlow`. */
  onNodesChange: OnNodesChange<CanvasNode>;
  onEdgesChange: OnEdgesChange<CanvasEdge>;
  onDelete: OnDelete<CanvasNode, CanvasEdge>;
}

/**
 * Imports a starter template into the collaborative canvas, replacing whatever is on
 * it, and fits the result into view.
 *
 * **There is no second copy of canvas state here.** The hook holds no nodes and no
 * edges: it is handed the room's current ones and the room's own mutations, builds
 * fresh ones from the template, and writes them through those mutations — the same
 * route a drop, a drag, a resize, and a connection already take. Nothing is written
 * to PostgreSQL, the `initial` nodes and edges the canvas passes `useLiveblocksFlow`
 * are untouched, and the room is not remounted: an import is a change to the
 * document, not a new document.
 *
 * Everybody in the room sees the replacement immediately, because it *is* the
 * document changing.
 */
export function useCanvasTemplateImport({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onDelete,
}: UseCanvasTemplateImportOptions): (template: CanvasTemplate) => void {
  const history = useHistory();
  const { fitView } = useReactFlow<CanvasNode, CanvasEdge>();

  /*
   * The nodes an import is still waiting to fit, or `null` when nothing is pending.
   *
   * A ref rather than state, deliberately: it is not rendered, and the effect below
   * clears it, so making it state would schedule a render for a value nothing draws.
   * It is also what makes the fit happen **once** per import rather than on every
   * subsequent change to the canvas.
   */
  const nodeIdsAwaitingFit = useRef<string[] | null>(null);

  const importTemplate = useCallback(
    (template: CanvasTemplate) => {
      /*
       * Fresh runtime nodes and edges, with new IDs and every connection remapped
       * onto them. Built before anything is written, so a failure to resolve the
       * template cannot leave the canvas cleared.
       */
      const instance = createCanvasTemplateInstance(template);

      /*
       * One undo step for the whole import.
       *
       * Liveblocks merges everything written while history is paused into a single
       * frame, so clearing the canvas and adding the template commit together and one
       * Undo restores the architecture that was there before — rather than the user
       * undoing an import edge by edge and node by node, and passing through a
       * completely empty canvas on the way.
       *
       * The `finally` is what guarantees the resume: a throw from any of the three
       * mutations would otherwise leave history paused for the rest of the session,
       * swallowing every later change into a frame nothing ever commits.
       *
       * Unlike the label editor, this needs no `hasPausedHistory` ref to know the
       * pause is its own. That guard exists because a pause held across an
       * asynchronous session can be resumed by the wrong owner; here the pause and
       * the resume are in one synchronous block with nothing awaited between them, so
       * no other pause can begin or end inside it.
       */
      history.pause();

      try {
        /*
         * Replace, not add. The current nodes and edges go through `onDelete` rather
         * than through `remove` changes, because `remove` is what React Flow reports
         * and *not* what deletes from Storage — the Liveblocks integration ignores it
         * and deletes only in this mutation, which takes the edges out before the
         * nodes so no edge is ever left pointing at a component that has gone.
         *
         * The call is skipped on an empty canvas, so importing into a fresh project
         * does not write a deletion of nothing into the history frame.
         */
        if (nodes.length > 0 || edges.length > 0) {
          onDelete({ nodes, edges });
        }

        /*
         * `add` changes rather than a `setNodes`, exactly as a drop uses:
         * `useLiveblocksFlow` owns the state and these handlers are what write into
         * the room's `flow` tree.
         *
         * Nodes before edges, the reverse of the deletion order, so an edge is never
         * added before the components it joins exist.
         */
        if (instance.nodes.length > 0) {
          onNodesChange(
            instance.nodes.map((node) => ({ type: "add", item: node }))
          );
        }

        if (instance.edges.length > 0) {
          onEdgesChange(
            instance.edges.map((edge) => ({ type: "add", item: edge }))
          );
        }
      } finally {
        history.resume();
      }

      /*
       * The fit is deferred rather than called here. React Flow fits the nodes in its
       * own store, and at this moment that store still holds the canvas as it was:
       * the new nodes have been written to Storage, but they reach this component as a
       * new `nodes` array on a later render. Fitting now would frame the architecture
       * that was just deleted.
       */
      nodeIdsAwaitingFit.current = instance.nodes.map((node) => node.id);
    },
    [edges, history, nodes, onDelete, onEdgesChange, onNodesChange]
  );

  /*
   * Fits the imported architecture as soon as it has actually arrived.
   *
   * The effect runs on every change to `nodes` and does nothing unless an import is
   * pending *and* every node it created is present — a guard rather than a
   * `setTimeout`, so the fit waits for the state it needs instead of for a guessed
   * interval, and so a collaborator's edit landing between the write and the fit
   * cannot trigger it early.
   *
   * By the time this runs, React Flow has the nodes too: `<ReactFlow>` syncs the prop
   * into its store from an effect of its own, and it is a child of the canvas
   * component this hook is used in, so React has already run it. The imported nodes
   * also carry an explicit width and height, so their bounds are correct before the
   * DOM has measured anything.
   */
  useEffect(() => {
    const awaitingFit = nodeIdsAwaitingFit.current;

    if (!awaitingFit) {
      return;
    }

    /* A template with no components — nothing to frame, so the wait just ends. */
    if (awaitingFit.length === 0) {
      nodeIdsAwaitingFit.current = null;
      return;
    }

    const presentNodeIds = new Set(nodes.map((node) => node.id));

    if (!awaitingFit.every((nodeId) => presentNodeIds.has(nodeId))) {
      return;
    }

    nodeIdsAwaitingFit.current = null;

    /*
     * The shared fit options, so an import comes to rest exactly where the control
     * bar's fit-view button and the canvas's own first fit do — `maxZoom` included,
     * which is what stops a small template filling the viewport. The animation is
     * added on top, as the button does, because this fit moves from wherever the user
     * was already looking.
     *
     * Fitted to the **imported** nodes by ID rather than to the whole canvas, so the
     * frame is the architecture that was just imported even if somebody else in the
     * room is drawing elsewhere at the same moment.
     *
     * The resulting viewport is this client's alone. It is not written to Storage or
     * to Presence and no collaborator's view moves — a viewport is not part of the
     * document, as the control bar records.
     */
    void fitView({
      ...canvasFitViewOptions,
      duration: CANVAS_VIEWPORT_ANIMATION_DURATION,
      nodes: awaitingFit.map((nodeId) => ({ id: nodeId })),
    });
  }, [fitView, nodes]);

  return importTemplate;
}
