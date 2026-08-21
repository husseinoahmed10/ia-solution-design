"use client";

import { createPortal } from "react-dom";

import { CanvasNodeBody } from "@/features/canvas/canvas-node-body";
import { DEFAULT_CANVAS_NODE_COLOR } from "@/features/canvas/canvas-node-tokens";
import type { CanvasDragPreviewState } from "@/hooks/use-canvas-drag-preview";

/**
 * The ghost that follows the cursor while a component is being dragged out of the
 * toolbar.
 *
 * It is the **same drawing as the node it will become** — `CanvasNodeBody`, the
 * shape renderer the canvas already uses — at the width and height from the drag
 * payload, in the default node colour. So the user sees what will land rather than
 * an approximation of it.
 *
 * Slightly transparent, and never drawn as selected: nothing exists yet for the
 * user to have selected, and the transparency is what says this is a preview
 * rather than a component that has already been placed.
 *
 * It is local to this browser. Nothing here reads or writes Liveblocks Storage or
 * Presence — the collaborative write happens on drop, through the canvas' existing
 * handler.
 */
interface CanvasDragPreviewProps {
  preview: CanvasDragPreviewState;
}

export function CanvasDragPreview({ preview }: CanvasDragPreviewProps) {
  const { payload, clientX, clientY } = preview;

  /*
   * Portalled to `document.body` and positioned `fixed`, for two reasons. The
   * pointer position is in viewport coordinates, and `fixed` is what those
   * coordinates address directly — inside the canvas, React Flow's transformed
   * viewport would become the containing block and the pan and zoom would be
   * applied to the ghost twice. And the cursor leaves the canvas during a drag, so
   * a preview clipped to the canvas region would vanish while the drag is still in
   * flight.
   *
   * `document.body` is only reachable in the browser, so the portal is guarded: the
   * canvas renders on the server too, and a preview cannot exist there because no
   * drag can have started.
   */
  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      /*
       * `pointer-events-none` so the ghost is never itself a drop target and never
       * interposes between the cursor and the canvas underneath it — with it, the
       * element under the pointer would be the preview and the drop would be lost.
       *
       * The half-size translate centres it on the cursor, matching what the drop
       * does: the drop handler offsets the new node by half its size, so the
       * component lands where the ghost was rather than shifted by half of itself.
       *
       * The z-index clears the two `z-40` side panels, so the ghost stays visible
       * while it is dragged across them.
       */
      className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 opacity-70"
      style={{
        left: clientX,
        top: clientY,
        width: payload.defaultWidth,
        height: payload.defaultHeight,
      }}
      /*
       * Decoration for a drag the user is already performing: the component's name
       * is announced by the toolbar button that is being dragged, so repeating it
       * here would be noise.
       */
      aria-hidden
    >
      <CanvasNodeBody
        label={payload.label}
        shape={payload.shape}
        color={DEFAULT_CANVAS_NODE_COLOR}
        width={payload.defaultWidth}
        height={payload.defaultHeight}
        selected={false}
      />
    </div>,
    document.body
  );
}
