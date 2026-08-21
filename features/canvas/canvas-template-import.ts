import { addEdge } from "@xyflow/react";

import { createCanvasNodeId } from "@/features/canvas/canvas-node-id";
import {
  resolveCanvasTemplateNodes,
  type CanvasTemplate,
} from "@/features/canvas/starter-templates";
import type { CanvasEdge, CanvasNode } from "@/types/canvas";

/**
 * Turns a starter template definition into fresh runtime canvas nodes and edges.
 *
 * A pure function: it reads a template and returns new objects. It touches no
 * Liveblocks Storage, no React Flow store, and no React state — writing the result
 * into the collaborative document is the canvas's job
 * (`hooks/use-canvas-template-import.ts`), and keeping that separate is what makes
 * the identifier and remapping rules below testable in isolation from the room.
 *
 * **Nothing in `CANVAS_TEMPLATES` is mutated or handed out.** Every node, every
 * edge, and every nested `position` and `data` object here is newly built from the
 * template's values, so importing the same template twice produces two independent
 * architectures and the library stays exactly as it was authored.
 */

export interface CanvasTemplateInstance {
  readonly nodes: CanvasNode[];
  readonly edges: CanvasEdge[];
}

export function createCanvasTemplateInstance(
  template: CanvasTemplate
): CanvasTemplateInstance {
  /*
   * The catalogue and token lookups happen once, in the same helper the card
   * preview uses, so an imported component is the shape, size, and label the
   * preview drew and the toolbar would have dropped.
   */
  const resolvedNodes = resolveCanvasTemplateNodes(template);

  /*
   * Template-local ID → the runtime ID just generated for it. The template's edges
   * name their ends with the local IDs, and only this map knows what those became,
   * so every connection is remapped through it rather than through anything the
   * template itself carries.
   */
  const runtimeNodeIds = new Map<string, string>();

  const nodes = resolvedNodes.map((resolved): CanvasNode => {
    /*
     * A fresh ID from the canvas's own helper — the same one a drop uses — rather
     * than the template's local ID. A node ID is a key in a `LiveMap` shared by
     * everyone in the room, and reusing `trigger` would mean two people importing
     * the same template into different projects were fine but a second import into
     * the same room silently overwrote the first architecture's components. The
     * helper's timestamp, counter, and random suffix rule out both.
     */
    const id = createCanvasNodeId(resolved.componentType);

    runtimeNodeIds.set(resolved.templateNodeId, id);

    return {
      id,
      type: "canvasNode",
      position: { x: resolved.x, y: resolved.y },
      /*
       * The size is set explicitly, as it is on a dropped node, so the component is
       * laid out at its shape's default size straight away and React Flow can fit
       * the imported architecture into view before it has measured anything.
       */
      width: resolved.width,
      height: resolved.height,
      data: {
        label: resolved.label,
        color: resolved.color,
        shape: resolved.shape,
        componentType: resolved.componentType,
      },
    };
  });

  const edges = template.edges.flatMap((templateEdge): CanvasEdge[] => {
    const source = runtimeNodeIds.get(templateEdge.source);
    const target = runtimeNodeIds.get(templateEdge.target);

    /*
     * An end whose node was not created — which only happens if its component type
     * has left the catalogue and `resolveCanvasTemplateNodes` skipped it. The
     * connection goes with it rather than being written with a dangling endpoint.
     */
    if (!source || !target) {
      return [];
    }

    /*
     * `addEdge` against an empty list is how the edge gets its ID. It is React
     * Flow's own generator, and it is the identifier convention already in the
     * room: `useLiveblocksFlow`'s `onConnect` builds a dragged connection exactly
     * this way, so an imported connection and a hand-drawn one are named alike and
     * there is no second edge-ID rule here to conflict with it. The ID is derived
     * from the two runtime node IDs and their handles, so it is as unique as they
     * are.
     *
     * `markerEnd` is deliberately not set. An arrowhead is edge *styling*, owned by
     * `canvasEdgeDefaults` where the canvas renders, and copying it onto stored
     * edges would be a second place to keep it in step.
     */
    return addEdge<CanvasEdge>(
      {
        source,
        target,
        sourceHandle: templateEdge.sourceHandle,
        targetHandle: templateEdge.targetHandle,
        type: "canvasEdge",
        /* Connections start unlabelled, as a dragged one does. */
        data: { label: "" },
      },
      []
    );
  });

  return { nodes, edges };
}
