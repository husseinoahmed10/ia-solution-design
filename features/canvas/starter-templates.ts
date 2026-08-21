import {
  canvasComponentsByType,
  type CanvasComponentDefinition,
} from "@/features/canvas/canvas-components";
import { canvasNodeShapeTokens } from "@/features/canvas/canvas-node-tokens";
import type {
  CanvasComponentType,
  CanvasNodeColor,
  CanvasNodeHandleId,
  CanvasNodeShape,
} from "@/types/canvas";

/**
 * The starter template library: predefined high-level IA solution architectures a
 * user can begin from instead of drawing every canvas from scratch.
 *
 * These are **high-level architecture examples only**, for the solution
 * architecture canvas. A `design-studio-process` and a `business-object` are one
 * component each here, exactly as they are in the toolbar — their internal stages
 * and actions belong to the detailed canvases they will each open later, and
 * inventing them here would mean inventing WorkHQ and Design Studio behaviour
 * (invariant 7).
 *
 * **A template describes structure, not appearance.** It names which IA component
 * sits where, which sides its connections run between, and which colour theme it
 * starts on. Everything else — the shape a component maps to, the size that shape
 * is drawn at, its label, how it is stroked, and how a connection is styled — is
 * read from the maps the canvas already uses (`canvas-components.ts`,
 * `canvas-node-tokens.ts`, `canvas-edge-tokens.ts`), so a template cannot drift
 * from what dragging the same components onto the canvas produces and there is no
 * second component-to-shape or component-to-size rule to keep in step.
 *
 * **Every definition here is immutable.** The types are `readonly` throughout and
 * nothing imports this module to change it: importing a template builds fresh
 * runtime nodes and edges from these values (`canvas-template-import.ts`), so a
 * user who imports the same template twice gets two independent architectures and
 * the library itself is untouched.
 */

/**
 * One component in a template.
 *
 * `id` is a **stable local identifier inside the template definition** and never
 * reaches Liveblocks Storage: it exists so the template's edges can name their two
 * ends, and importing replaces it with a fresh runtime node ID. Two templates may
 * therefore reuse the same readable local IDs without any risk of collision.
 *
 * `position` is the component's top-left corner in canvas units, laid out so the
 * flow reads left to right with the shapes on a row sharing a centre line. The
 * numbers account for each shape's own drawn height, which is why they are not all
 * the same on one row.
 */
export interface CanvasTemplateNode {
  readonly id: string;
  readonly componentType: CanvasComponentType;
  readonly position: { readonly x: number; readonly y: number };
  /**
   * Which colour theme the component starts on. Stated for every node rather than
   * defaulted, so a template's whole appearance is readable in one place.
   *
   * The colours are a **visual grouping and nothing more**, as the token map says:
   * WorkHQ components are drawn in one theme and Design Studio components in
   * another so a hybrid architecture is legible at a glance, and anything outside
   * the solution is left on the default surface. No code reads a node's colour to
   * decide anything, and the user recolours any of them afterwards.
   */
  readonly color: CanvasNodeColor;
}

/**
 * One connection in a template.
 *
 * `source` and `target` are template-local node IDs, not runtime ones. Importing
 * remaps both to the fresh node IDs it has just generated, so an imported
 * connection can only ever point at a node from the same import.
 *
 * Both handles are named, rather than left for React Flow to choose, because a
 * high-level architecture is read as a direction: a left-to-right step runs
 * `right` to `left`, and a step down to the next row runs `bottom` to `top`.
 */
export interface CanvasTemplateEdge {
  readonly source: string;
  readonly target: string;
  readonly sourceHandle: CanvasNodeHandleId;
  readonly targetHandle: CanvasNodeHandleId;
}

/** One entry in the template library. */
export interface CanvasTemplate {
  /** Stable identifier, used as the React key and in the import call. */
  readonly id: string;
  readonly name: string;
  /** One line describing the architecture, shown on the template's card. */
  readonly description: string;
  readonly nodes: readonly CanvasTemplateNode[];
  readonly edges: readonly CanvasTemplateEdge[];
}

/**
 * The templates, in the order they appear in the modal: the simplest first.
 *
 * There is deliberately no category, no tag, and no search — three templates are
 * read at a glance, and grouping them would be structure without content.
 */
export const CANVAS_TEMPLATES: readonly CanvasTemplate[] = [
  {
    id: "workhq-agentic-workflow",
    name: "WorkHQ Agentic Workflow",
    description:
      "Work starts on a trigger, runs an action, is carried out by an agent, is checked by a person, and reaches another system through a connector.",
    nodes: [
      {
        id: "trigger",
        componentType: "workhq-trigger",
        position: { x: 0, y: -48 },
        color: "blue",
      },
      {
        id: "action",
        componentType: "workhq-action",
        position: { x: 196, y: -36 },
        color: "blue",
      },
      {
        id: "agent",
        componentType: "workhq-agent",
        position: { x: 476, y: -52 },
        color: "blue",
      },
      {
        id: "human-task",
        componentType: "workhq-human-task",
        position: { x: 760, y: -32 },
        color: "amber",
      },
      {
        id: "connector",
        componentType: "workhq-connector",
        position: { x: 1060, y: -52 },
        color: "default",
      },
    ],
    edges: [
      {
        source: "trigger",
        target: "action",
        sourceHandle: "right",
        targetHandle: "left",
      },
      {
        source: "action",
        target: "agent",
        sourceHandle: "right",
        targetHandle: "left",
      },
      {
        source: "agent",
        target: "human-task",
        sourceHandle: "right",
        targetHandle: "left",
      },
      {
        source: "human-task",
        target: "connector",
        sourceHandle: "right",
        targetHandle: "left",
      },
    ],
  },
  {
    id: "design-studio-queue-processing",
    name: "Design Studio Queue Processing",
    description:
      "Items wait in a work queue, a Design Studio process works them, a business object holds what they are made of, and the result is written to an external application.",
    nodes: [
      {
        id: "work-queue",
        componentType: "work-queue",
        position: { x: 0, y: -50 },
        color: "green",
      },
      {
        id: "process",
        componentType: "design-studio-process",
        position: { x: 268, y: -32 },
        color: "green",
      },
      {
        id: "business-object",
        componentType: "business-object",
        position: { x: 568, y: -36 },
        color: "green",
      },
      {
        id: "external-application",
        componentType: "external-application",
        position: { x: 848, y: -36 },
        color: "default",
      },
    ],
    edges: [
      {
        source: "work-queue",
        target: "process",
        sourceHandle: "right",
        targetHandle: "left",
      },
      {
        source: "process",
        target: "business-object",
        sourceHandle: "right",
        targetHandle: "left",
      },
      {
        source: "business-object",
        target: "external-application",
        sourceHandle: "right",
        targetHandle: "left",
      },
    ],
  },
  {
    id: "hybrid-workhq-digital-worker",
    name: "Hybrid WorkHQ + Digital Worker",
    description:
      "A WorkHQ front end starts the work and hands it to a digital worker, which runs a Design Studio process against a business object and an external application.",
    /*
     * Two rows rather than one. Six components in a single line make a strip too
     * wide to read either on the canvas or in the card preview, so the WorkHQ front
     * end runs across the top and the step down to Design Studio is the one vertical
     * connection — which is also what shows where the handover happens.
     */
    nodes: [
      {
        id: "trigger",
        componentType: "workhq-trigger",
        position: { x: 0, y: -48 },
        color: "blue",
      },
      {
        id: "action",
        componentType: "workhq-action",
        position: { x: 196, y: -36 },
        color: "blue",
      },
      {
        id: "digital-worker",
        componentType: "digital-worker",
        position: { x: 476, y: -32 },
        color: "blue",
      },
      {
        id: "process",
        componentType: "design-studio-process",
        position: { x: 476, y: 228 },
        color: "green",
      },
      {
        id: "business-object",
        componentType: "business-object",
        position: { x: 776, y: 224 },
        color: "green",
      },
      {
        id: "external-application",
        componentType: "external-application",
        position: { x: 1056, y: 224 },
        color: "default",
      },
    ],
    edges: [
      {
        source: "trigger",
        target: "action",
        sourceHandle: "right",
        targetHandle: "left",
      },
      {
        source: "action",
        target: "digital-worker",
        sourceHandle: "right",
        targetHandle: "left",
      },
      {
        source: "digital-worker",
        target: "process",
        sourceHandle: "bottom",
        targetHandle: "top",
      },
      {
        source: "process",
        target: "business-object",
        sourceHandle: "right",
        targetHandle: "left",
      },
      {
        source: "business-object",
        target: "external-application",
        sourceHandle: "right",
        targetHandle: "left",
      },
    ],
  },
];

/**
 * A template component with everything needed to draw or create it, gathered from
 * the maps the canvas already uses.
 *
 * Flat numbers rather than a nested position and size, because both consumers do
 * arithmetic on them: the import offsets nothing and copies them onto a node, and
 * the preview scales them into its own box.
 */
export interface ResolvedCanvasTemplateNode {
  /** The template-local ID, which the template's edges refer to. */
  readonly templateNodeId: string;
  readonly componentType: CanvasComponentType;
  /** The component's own catalogue name, which is what a dropped node starts with. */
  readonly label: string;
  readonly shape: CanvasNodeShape;
  readonly color: CanvasNodeColor;
  /** Top-left in canvas units. */
  readonly x: number;
  readonly y: number;
  /** The shape's default size in canvas units. */
  readonly width: number;
  readonly height: number;
}

/**
 * Resolves a template's components against the component catalogue and the shape
 * token map.
 *
 * This is the **one** place a template node becomes something drawable, shared by
 * the import and by the card preview, so the two cannot disagree about what a
 * template looks like. Nothing is derived here that the canvas does not already
 * derive the same way: the label and the shape come from the catalogue entry, and
 * the size comes from that shape's tokens — the same two lookups the toolbar makes
 * when it builds a drag payload.
 *
 * A component type the catalogue no longer holds is **skipped** rather than drawn
 * as a fallback shape. Every type in the library is authored against the
 * catalogue, so this can only happen if a component is removed from it, and in that
 * case leaving the component out is honest while a stand-in rectangle would not
 * be. The edges attached to it are dropped with it, because the import remaps an
 * edge through the nodes it actually created.
 */
export function resolveCanvasTemplateNodes(
  template: CanvasTemplate
): ResolvedCanvasTemplateNode[] {
  return template.nodes.flatMap((templateNode) => {
    const component: CanvasComponentDefinition | undefined =
      canvasComponentsByType.get(templateNode.componentType);

    if (!component) {
      return [];
    }

    const shapeTokens = canvasNodeShapeTokens[component.shape];

    return [
      {
        templateNodeId: templateNode.id,
        componentType: templateNode.componentType,
        label: component.label,
        shape: component.shape,
        color: templateNode.color,
        x: templateNode.position.x,
        y: templateNode.position.y,
        width: shapeTokens.defaultWidth,
        height: shapeTokens.defaultHeight,
      },
    ];
  });
}
