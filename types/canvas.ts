import type { Edge, Node } from "@xyflow/react";

/**
 * The shared shape of the architecture canvas.
 *
 * A component on the canvas is a labelled shape carrying which IA component it
 * represents. The shapes are this application's own visual conventions for a
 * high-level solution design — they are not a reproduction of the WorkHQ or
 * Design Studio interface, and no WorkHQ or Design Studio capability, field, or
 * rule is modelled here (invariant 7).
 *
 * They live in `types/` rather than in a feature module because both the canvas
 * components and `liveblocks.config.ts` at the project root refer to them: the
 * Liveblocks `Storage` tree is typed from the same node and edge types React Flow
 * renders, so the collaborative document and the canvas cannot drift apart.
 *
 * This file stays type-only. The values these unions index — the component
 * catalogue, the sizes, and the classes each shape and colour is drawn with —
 * live in `features/canvas/`, so nothing in `types/` reaches into a feature.
 */

/**
 * How a component is drawn.
 *
 * `diamond` has no component in the toolbar yet. It is kept because decision and
 * branching components will need it, and a renderer that already covers it does
 * not have to be reopened for them.
 */
export type CanvasNodeShape =
  | "rectangle"
  | "diamond"
  | "circle"
  | "pill"
  | "cylinder"
  | "hexagon";

/**
 * The IA components a solution design is drawn from, grouped in the toolbar as
 * WorkHQ, Design Studio, and shared components.
 *
 * These literals are part of the collaborative document — one is stored on every
 * node in Liveblocks Storage — so they are stable identifiers rather than display
 * text. The label shown to a user comes from the catalogue in
 * `features/canvas/canvas-components.ts`, so renaming a component in the
 * interface does not rewrite what is already stored.
 *
 * `design-studio-process` and `business-object` represent a high-level component
 * on this canvas. Each will later open its own detailed design canvas, which is
 * why they are single components here and not a stage-level breakdown.
 */
export type CanvasComponentType =
  | "workhq-trigger"
  | "workhq-action"
  | "workhq-agent"
  | "workhq-human-task"
  | "workhq-connector"
  | "digital-worker"
  | "design-studio-process"
  | "business-object"
  | "work-queue"
  | "api"
  | "database"
  | "external-application"
  | "human-actor";

/**
 * Which entry of the shared canvas colour map a component is drawn with.
 *
 * A name, not a colour: the surface, border, and label colour each one resolves
 * to are defined once in `features/canvas/canvas-node-tokens.ts`
 * (`ui-context.md`), so no component holds a colour of its own and a node in
 * Storage carries only this key — never a background, text, or border value.
 *
 * These are **visual choices only.** `blue` does not mean WorkHQ and `green`
 * does not mean a Design Studio stage: nothing in the application reads a colour
 * to decide anything, and giving one architectural meaning would be inventing
 * behaviour neither product has been specified to have here (invariant 7).
 *
 * The names are part of the collaborative document, so they are stable
 * identifiers rather than display text — the swatch label a user sees comes from
 * the token map.
 */
export type CanvasNodeColor = "default" | "blue" | "green" | "amber" | "red";

/**
 * What a canvas component carries.
 *
 * A `type` alias rather than an `interface`, against the usual rule in
 * `code-standards.md`: React Flow constrains node data to
 * `Record<string, unknown>`, and TypeScript gives an alias of an object literal
 * an implicit index signature while an `interface` gets none, so an interface
 * cannot satisfy the constraint.
 *
 * `label` is required — an unlabelled component on an architecture diagram says
 * nothing. The other three are optional so that a node stored before they existed
 * still reads, and the renderer falls back to a default for each.
 */
export type CanvasNodeData = {
  label: string;
  color?: CanvasNodeColor;
  shape?: CanvasNodeShape;
  componentType?: CanvasComponentType;
};

/**
 * Which side of a component a connection is attached to.
 *
 * Part of the collaborative document, like the two unions above: an edge in
 * Liveblocks Storage records the handle each of its ends is attached to, and React
 * Flow routes the line from that handle's side. Renaming one of these literals
 * would detach every stored connection, so they are fixed.
 *
 * The union lives here rather than in a feature module because two features now
 * name the same four sides — `features/canvas/canvas-node.tsx`, which declares the
 * handles, and `features/canvas/starter-templates.ts`, whose template edges say
 * which sides they run between — and a template that named a side the node does
 * not declare would produce a connection with nowhere to start.
 *
 * The values these literals index — which `Position` each side is drawn at — stay
 * in the node renderer, exactly as the component catalogue and the token maps stay
 * out of `types/`.
 */
export type CanvasNodeHandleId = "top" | "right" | "bottom" | "left";

/**
 * What a connection between two components carries.
 *
 * A `type` alias rather than an `interface` for the same reason `CanvasNodeData`
 * is: React Flow constrains edge data to `Record<string, unknown>`, which an alias
 * of an object literal satisfies through its implicit index signature and an
 * `interface` does not.
 *
 * `label` is what the connection is called on the diagram — "submits", "reads
 * from" — and it lives in `data` rather than in React Flow's own top-level `label`
 * because it is drawn as an HTML pill through `EdgeLabelRenderer` rather than as
 * React Flow's built-in SVG text, and it is edited in place through
 * `updateEdgeData`.
 *
 * It is **optional, and read as an empty string when absent**, so a connection
 * stored before this field existed still reads. A label is the only thing a
 * connection carries: a relationship *type* — invokes, uses, reads, writes — and a
 * style per type are later units, and inventing them here would mean inventing
 * architectural semantics neither product has been specified to have (invariant 7).
 */
export type CanvasEdgeData = {
  label?: string;
};

/**
 * The one custom node type, `canvasNode`, and the one custom edge type,
 * `canvasEdge`. The literals are part of the collaborative document — they are
 * stored on every node and edge in Liveblocks Storage — so they are fixed here
 * rather than written inline at a call site.
 *
 * `canvasNode` is rendered by `features/canvas/canvas-node.tsx` and `canvasEdge`
 * by `features/canvas/canvas-edge.tsx`. There is one edge model, not one per kind
 * of connection.
 */
export type CanvasNode = Node<CanvasNodeData, "canvasNode">;
export type CanvasEdge = Edge<CanvasEdgeData, "canvasEdge">;
