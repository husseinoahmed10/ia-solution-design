"use client";

import { useCallback, useEffect, useState } from "react";

import type { CanvasComponentDragPayload } from "@/features/canvas/canvas-drag-payload";

/**
 * The state behind the ghost that follows the cursor while a component is being
 * dragged out of the toolbar.
 *
 * **This is deliberately local to one browser.** It is React state and nothing
 * else: it is never written to Liveblocks Storage, because a preview is not part
 * of the document — nothing has been created yet — and never to Presence, because
 * what another person is *about* to drop is not information this unit shows. The
 * collaborative write happens once, on drop, through the existing
 * `onNodesChange` path, which is untouched.
 *
 * The pointer is tracked from `dragover` on the document rather than from
 * `mousemove`, because a native HTML5 drag suppresses mouse events entirely: only
 * the drag events carry coordinates while a drag is in flight. The listener
 * deliberately does **not** call `preventDefault`, so it observes the drag without
 * making the whole page a drop target — where a component may actually be dropped
 * is still decided by the canvas' own `dragover` handler.
 */
export interface CanvasDragPreviewState {
  /**
   * The payload that was written to the drag, so the ghost is drawn from the same
   * value that will reach the drop handler rather than from a second description
   * of the component.
   */
  payload: CanvasComponentDragPayload;
  /** The pointer, in viewport coordinates. */
  clientX: number;
  clientY: number;
}

export interface CanvasDragPreviewController {
  /** `null` whenever no component is being dragged. */
  preview: CanvasDragPreviewState | null;
  /** Called from `dragstart`, with the payload that was written to the event. */
  startPreview(
    payload: CanvasComponentDragPayload,
    clientX: number,
    clientY: number
  ): void;
  /**
   * Called from `dragend`, which the browser fires on the drag source after a drop
   * **and** after a cancellation — an Escape, or a release outside a drop target —
   * so one call site removes the preview in every case.
   */
  endPreview(): void;
}

export function useCanvasDragPreview(): CanvasDragPreviewController {
  const [preview, setPreview] = useState<CanvasDragPreviewState | null>(null);

  const startPreview = useCallback(
    (
      payload: CanvasComponentDragPayload,
      clientX: number,
      clientY: number
    ) => {
      /*
       * Seeded with the `dragstart` position, so the ghost appears under the cursor
       * immediately instead of at the top-left corner until the first `dragover`
       * arrives.
       */
      setPreview({ payload, clientX, clientY });
    },
    []
  );

  const endPreview = useCallback(() => setPreview(null), []);

  const isDragging = preview !== null;

  useEffect(() => {
    if (!isDragging) {
      return;
    }

    function handleDragOver(event: DragEvent) {
      setPreview((current) =>
        current
          ? { ...current, clientX: event.clientX, clientY: event.clientY }
          : current
      );
    }

    /*
     * Subscribed only while a drag is in flight, and on the document rather than
     * on the canvas, so the ghost keeps up with the cursor over the toolbar, the
     * navbar, and the side panels as well as over the canvas itself.
     */
    document.addEventListener("dragover", handleDragOver);

    return () => document.removeEventListener("dragover", handleDragOver);
  }, [isDragging]);

  return { preview, startPreview, endPreview };
}
