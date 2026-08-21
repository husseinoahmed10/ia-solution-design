import { z } from "zod";

import {
  canvasComponentTypes,
  type CanvasComponentDefinition,
} from "@/features/canvas/canvas-components";
import {
  canvasNodeShapes,
  canvasNodeShapeTokens,
} from "@/features/canvas/canvas-node-tokens";

/**
 * What travels on the drag from the toolbar to the canvas.
 *
 * The two ends are the same application, but they are joined by
 * `DataTransfer` — a browser channel carrying a string — so what arrives at the
 * drop handler is genuinely unknown input and is validated with Zod before it is
 * used (`code-standards.md`). A stale payload from an older tab is the realistic
 * case: the component type it names may no longer exist.
 *
 * The payload is self-contained rather than a bare component type, because the
 * drop handler should not have to look anything up to create a node: the label,
 * the shape, and the size it needs are all in the message.
 */

/** The `DataTransfer` type the payload is stored under. */
export const CANVAS_COMPONENT_MIME_TYPE = "application/x-ia-canvas-component";

/**
 * The payload schema. `defaultWidth` and `defaultHeight` are bounded on both
 * sides: a node with a zero or negative size would be invisible and unselectable,
 * and an enormous one would swallow the canvas.
 */
export const canvasComponentDragPayloadSchema = z.object({
  componentType: z.enum(canvasComponentTypes),
  label: z.string().trim().min(1).max(120),
  shape: z.enum(canvasNodeShapes),
  defaultWidth: z.number().int().positive().max(2000),
  defaultHeight: z.number().int().positive().max(2000),
});

export type CanvasComponentDragPayload = z.infer<
  typeof canvasComponentDragPayloadSchema
>;

/**
 * Builds the payload for a component. The size comes from the shape's entry in the
 * shared token map, so the toolbar holds no dimensions of its own.
 */
export function toCanvasComponentDragPayload(
  component: CanvasComponentDefinition
): CanvasComponentDragPayload {
  const { defaultWidth, defaultHeight } = canvasNodeShapeTokens[component.shape];

  return {
    componentType: component.type,
    label: component.label,
    shape: component.shape,
    defaultWidth,
    defaultHeight,
  };
}

/**
 * Writes the payload onto a drag event.
 *
 * It is set under a custom MIME type rather than `"text/plain"` so a drag from
 * somewhere else in the browser — a selection, a link, a file — cannot be mistaken
 * for a component. `effectAllowed = "copy"` matches what the drop does: the
 * toolbar button stays where it is and a new node is created.
 *
 * The payload it wrote is returned, so the drag preview can be drawn from the same
 * value that crossed the wire rather than from a second construction of it. The
 * ghost the user drags and the node that lands are then the same shape and size by
 * construction, not by two call sites agreeing.
 */
export function writeCanvasComponentDragPayload(
  dataTransfer: DataTransfer,
  component: CanvasComponentDefinition
): CanvasComponentDragPayload {
  const payload = toCanvasComponentDragPayload(component);

  dataTransfer.setData(CANVAS_COMPONENT_MIME_TYPE, JSON.stringify(payload));
  dataTransfer.effectAllowed = "copy";

  return payload;
}

/**
 * Reads the payload back off a drop event, or `null` if this drag is not one of
 * ours or does not survive validation.
 *
 * Returning `null` rather than throwing is deliberate: a drop the canvas does not
 * understand is a no-op, not an error to report. There is nothing for the user to
 * correct and nothing was changed.
 */
export function readCanvasComponentDragPayload(
  dataTransfer: DataTransfer
): CanvasComponentDragPayload | null {
  const raw = dataTransfer.getData(CANVAS_COMPONENT_MIME_TYPE);

  if (!raw) {
    return null;
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  const result = canvasComponentDragPayloadSchema.safeParse(parsed);

  return result.success ? result.data : null;
}

/**
 * Whether a drag carries a canvas component at all.
 *
 * `dragover` fires continuously and cannot read the payload — the browser hides
 * the data until the drop, so only the *types* are visible during the drag — which
 * is exactly what this checks. It is what decides whether the canvas accepts the
 * drop, so a drag from outside the application is not answered with a drop cursor.
 */
export function hasCanvasComponentDragPayload(dataTransfer: DataTransfer): boolean {
  return dataTransfer.types.includes(CANVAS_COMPONENT_MIME_TYPE);
}
