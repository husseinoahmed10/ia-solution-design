"use client";

import { Panel } from "@xyflow/react";
import type { DragEvent } from "react";

import {
  canvasComponentGroups,
  type CanvasComponentDefinition,
} from "@/features/canvas/canvas-components";
import { CanvasDragPreview } from "@/features/canvas/canvas-drag-preview";
import { writeCanvasComponentDragPayload } from "@/features/canvas/canvas-drag-payload";
import {
  useCanvasDragPreview,
  type CanvasDragPreviewController,
} from "@/hooks/use-canvas-drag-preview";

/**
 * The component toolbar: a floating pill at the bottom-centre of the canvas holding
 * every IA component, grouped as WorkHQ, Design Studio, and shared.
 *
 * A React Flow `Panel`, so it is positioned over the viewport by React Flow's own
 * `base.css` rather than by a hand-written overlay, and it moves with the canvas
 * region instead of with the page. `nopan` and `nowheel` keep a drag or a scroll
 * that starts on the toolbar from panning and zooming the canvas underneath it.
 *
 * A component is added by dragging it onto the canvas. The drop handler in
 * `architecture-canvas.tsx` is what creates the node — this component only
 * describes what is being dragged, so the toolbar holds no canvas state.
 *
 * It does hold the **drag preview** state, because the drag starts and ends here:
 * `dragstart` and `dragend` both fire on the drag source, so one hook mounted here
 * covers both the appearance and the removal of the ghost. The preview is local to
 * this browser and is not part of the document — nothing about it reaches
 * Liveblocks Storage or Presence.
 */
export function CanvasComponentToolbar() {
  const dragPreview = useCanvasDragPreview();

  return (
    <>
      <Panel
        position="bottom-center"
        className="nopan nowheel max-w-[min(calc(100%-2rem),64rem)]"
      >
        {/*
         * `overflow-x-auto` rather than wrapping: the toolbar is a single pill, and at
         * a narrow width the groups scroll sideways instead of the pill growing into a
         * block that covers the canvas. The canvas is a desktop-first surface
         * (`ui-context.md`), so this is a fallback rather than the intended layout.
         */}
        <nav
          aria-label="Solution components"
          className="flex max-w-full items-stretch gap-1 overflow-x-auto rounded-full border border-border bg-card/95 p-1.5 shadow-lg backdrop-blur"
        >
          {canvasComponentGroups.map((group, groupIndex) => (
            <div key={group.id} className="flex items-stretch gap-1">
              {/*
               * A divider between groups rather than before each one, so the pill does
               * not open with a rule against its rounded edge.
               */}
              {groupIndex > 0 ? (
                <div aria-hidden className="my-1 w-px shrink-0 bg-border" />
              ) : null}

              {/*
               * The group name is shown, not only announced. The icons are of WorkHQ
               * and Design Studio concepts a new user has no reason to recognise, so
               * the heading is what tells them which product a component belongs to.
               */}
              <div
                role="group"
                aria-label={group.label}
                className="flex items-center gap-1"
              >
                <span className="px-2 text-xs font-semibold tracking-tight whitespace-nowrap text-muted-foreground">
                  {group.label}
                </span>

                {group.components.map((component) => (
                  <ComponentDragButton
                    key={component.type}
                    component={component}
                    dragPreview={dragPreview}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>
      </Panel>

      {/*
       * Rendered outside the `Panel`, because the ghost follows the cursor across the
       * whole viewport rather than living in the toolbar. It portals to
       * `document.body` itself; this is only where it is mounted.
       *
       * Absent whenever no drag is in flight, which is what removes it after a drop
       * and after a cancellation alike.
       */}
      {dragPreview.preview ? (
        <CanvasDragPreview preview={dragPreview.preview} />
      ) : null}
    </>
  );
}

/**
 * One draggable component.
 *
 * A `button` rather than a `div`, so it is in the tab order and reads as a control.
 * It has no click behaviour — a component is created by dragging it onto the
 * canvas, and there is no cursor position for a click to mean — so it is left as a
 * labelled drag source rather than wired to a no-op.
 */
function ComponentDragButton({
  component,
  dragPreview,
}: {
  component: CanvasComponentDefinition;
  dragPreview: CanvasDragPreviewController;
}) {
  const Icon = component.icon;

  function handleDragStart(event: DragEvent<HTMLButtonElement>) {
    const payload = writeCanvasComponentDragPayload(
      event.dataTransfer,
      component
    );

    /*
     * The browser's own drag image is a translucent snapshot of this button, which
     * would sit beside our ghost as a second preview of the same drag. It is
     * replaced with a transparent 1×1 image so the shape preview is the only thing
     * following the cursor. The payload and the drop are untouched by this — it
     * changes what the drag *looks* like and nothing else.
     */
    event.dataTransfer.setDragImage(getTransparentDragImage(), 0, 0);

    /* The preview is drawn from the payload that was actually written to the drag. */
    dragPreview.startPreview(payload, event.clientX, event.clientY);
  }

  return (
    <button
      type="button"
      draggable
      onDragStart={handleDragStart}
      /*
       * `dragend` fires on the drag source after a successful drop **and** after a
       * cancellation — Escape, or a release outside a drop target — so this one
       * handler removes the preview in every case rather than needing the canvas to
       * report a drop back.
       */
      onDragEnd={dragPreview.endPreview}
      /*
       * The icon is decorative — `aria-hidden` on the svg — so the name is carried
       * by the visible text, and the description is attached with `title` for a
       * hover hint on an unfamiliar icon (`ui-context.md`).
       */
      title={component.description}
      className="flex shrink-0 cursor-grab items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 active:cursor-grabbing"
    >
      <Icon aria-hidden className="size-3.5" />
      {component.label}
    </button>
  );
}

/**
 * A transparent 1×1 canvas, standing in for the drag image the browser would
 * otherwise draw.
 *
 * A `canvas` rather than an `Image`: an image has to have finished loading by the
 * time `setDragImage` is called, and `dragstart` is not a moment where that can be
 * relied on, while a canvas with nothing drawn on it is transparent immediately.
 *
 * Created once, on the first drag, and kept — building one per `dragstart` would
 * allocate an element on every drag for no gain. It is created lazily rather than at
 * module scope because this module is also evaluated on the server, where there is
 * no `document`.
 */
let transparentDragImage: HTMLCanvasElement | null = null;

function getTransparentDragImage(): HTMLCanvasElement {
  if (!transparentDragImage) {
    transparentDragImage = document.createElement("canvas");
    transparentDragImage.width = 1;
    transparentDragImage.height = 1;
  }

  return transparentDragImage;
}
