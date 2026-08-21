"use client";

import {
  useCanRedo,
  useCanUndo,
  useRedo,
  useUndo,
} from "@liveblocks/react/suspense";
import { Panel, useReactFlow } from "@xyflow/react";
import { Maximize, Redo2, Undo2, ZoomIn, ZoomOut } from "lucide-react";
import { useCallback, type ComponentType } from "react";

import { Button } from "@/components/ui/button";
import {
  CANVAS_CONTROL_BAR_BOTTOM_OFFSET,
  CANVAS_VIEWPORT_ANIMATION_DURATION,
  canvasFitViewOptions,
} from "@/features/canvas/canvas-control-tokens";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import type { CanvasEdge, CanvasNode } from "@/types/canvas";

/**
 * The canvas control bar: a floating pill at the bottom-left holding how the canvas
 * is navigated and how a change is taken back.
 *
 * A React Flow `Panel`, like the component toolbar, so React Flow's own `base.css`
 * positions it over the viewport and it belongs to the canvas region rather than to
 * the page. `nopan` and `nowheel` keep a press or a scroll that starts on the bar
 * from panning and zooming the canvas underneath it.
 *
 * It is also where the keyboard shortcuts are mounted, and deliberately so: this is
 * the one component that holds all four actions a shortcut runs, so a key and the
 * button beside it are the same call rather than two definitions of one action. The
 * bar is mounted for as long as the canvas is, so the shortcuts live exactly as long
 * as the thing they operate on.
 *
 * **Nothing here is canvas state.** Zooming and fitting move this client's viewport,
 * which is not part of the document — it is not written to Liveblocks Storage or to
 * Presence, and nobody else's view moves. Undo and redo are Liveblocks' own history,
 * so there is no second history stack and React Flow's local state is not used as
 * one.
 */
export function CanvasControlBar() {
  /*
   * The viewport methods, from the same React Flow store the drop handler reads —
   * `ReactFlowProvider` is mounted above the flow in `architecture-canvas.tsx`. They
   * are React Flow's own, so the transform stays React Flow's: nothing here computes
   * a zoom level or writes a transform of its own.
   */
  const { zoomIn, zoomOut, fitView } = useReactFlow<CanvasNode, CanvasEdge>();

  /*
   * Liveblocks history, not a stack kept here. The room already records every change
   * this client made to the canvas — a component dropped, moved, resized, recoloured,
   * renamed, connected, or deleted — because all of them go through
   * `useLiveblocksFlow`, so undo is the room's own inverse of that change and it
   * takes back **this** client's edits rather than a collaborator's.
   */
  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  /*
   * Each viewport call returns a promise that resolves when the animation ends.
   * Nothing here waits for it — a control has finished as soon as the movement has
   * started — so it is discarded explicitly rather than returned from a handler that
   * is typed as returning nothing.
   */
  const handleZoomIn = useCallback(() => {
    void zoomIn({ duration: CANVAS_VIEWPORT_ANIMATION_DURATION });
  }, [zoomIn]);

  const handleZoomOut = useCallback(() => {
    void zoomOut({ duration: CANVAS_VIEWPORT_ANIMATION_DURATION });
  }, [zoomOut]);

  const handleFitView = useCallback(() => {
    /*
     * The shared fit options, so the button comes to rest where the canvas' own
     * initial fit does, with the animation added on top — this fit moves from
     * somewhere the user was already looking, unlike the one on first load.
     */
    void fitView({
      ...canvasFitViewOptions,
      duration: CANVAS_VIEWPORT_ANIMATION_DURATION,
    });
  }, [fitView]);

  useKeyboardShortcuts({
    onZoomIn: handleZoomIn,
    onZoomOut: handleZoomOut,
    /*
     * The history actions are passed straight through, unguarded by `canUndo` and
     * `canRedo`: Liveblocks does nothing when there is nothing to undo, so a guard
     * here would be a second opinion about the state of a stack this component does
     * not own.
     */
    onUndo: undo,
    onRedo: redo,
  });

  return (
    <Panel
      position="bottom-left"
      className="nopan nowheel"
      /*
       * Lifted clear of the component toolbar, which is a bottom-centre pill that
       * grows to nearly the full width of the canvas — so at a narrow window the two
       * would meet in this corner. The offset is inline for the specificity reason
       * the token map records.
       */
      style={{ bottom: CANVAS_CONTROL_BAR_BOTTOM_OFFSET }}
    >
      {/*
       * The same floating surface as the component toolbar and a node's colour
       * toolbar — a bordered pill on `--card` with a shadow and a backdrop blur — so
       * every overlay on the canvas reads as the same kind of thing.
       */}
      <div
        role="group"
        aria-label="Canvas controls"
        className="flex items-center gap-1 rounded-full border border-border bg-card/95 p-1.5 shadow-lg backdrop-blur"
      >
        <div role="group" aria-label="Zoom" className="flex items-center gap-1">
          <CanvasControlButton
            icon={ZoomOut}
            label="Zoom out"
            shortcut="-"
            onClick={handleZoomOut}
          />
          {/*
           * Fitting sits between the two zoom controls rather than beside them,
           * because it is the way back from either: zoomed too far in or too far
           * out, the button that recovers is the one in the middle.
           */}
          <CanvasControlButton
            icon={Maximize}
            label="Fit view"
            onClick={handleFitView}
          />
          <CanvasControlButton
            icon={ZoomIn}
            label="Zoom in"
            shortcut="+"
            onClick={handleZoomIn}
          />
        </div>

        {/*
         * A subtle rule between the two groups. Navigating the canvas and changing
         * what is on it are different kinds of action, and the divider is what says
         * so — it is inset from the pill's edges so it does not read as a border.
         */}
        {/*
         * `self-stretch` is load-bearing: the pill is `items-center`, and a `w-px`
         * element with no content is 0px tall unless it is told to fill the row.
         */}
        <div aria-hidden className="my-1 w-px shrink-0 self-stretch bg-border" />

        <div
          role="group"
          aria-label="History"
          className="flex items-center gap-1"
        >
          <CanvasControlButton
            icon={Undo2}
            label="Undo"
            shortcut="Ctrl/⌘ + Z"
            onClick={undo}
            /*
             * Nothing of this client's to take back. Liveblocks reports it, so the
             * control follows the room's own history rather than a guess made here.
             */
            disabled={!canUndo}
          />
          <CanvasControlButton
            icon={Redo2}
            label="Redo"
            shortcut="Ctrl/⌘ + Shift + Z"
            onClick={redo}
            disabled={!canRedo}
          />
        </div>
      </div>
    </Panel>
  );
}

/**
 * One control: an icon, its name, and the keys that do the same thing.
 *
 * The shadcn `Button` primitive in its ghost icon form rather than a bare `button`,
 * which is `code-standards.md`'s order of preference and also what dims a disabled
 * control — `disabled:opacity-50` and `disabled:pointer-events-none` come with the
 * primitive, so an unavailable history action is visibly unavailable without a
 * second set of styles here. The radius is overridden to a full round, because these
 * sit inside a pill.
 *
 * The icon is decorative — `aria-hidden` — so the accessible name is the label
 * alone, and the hover hint adds the shortcut to it. Both modifiers are named in the
 * hint rather than the one this platform uses: detecting the platform would put a
 * value in the markup that the server could not know, and the shortcut itself accepts
 * either key.
 */
function CanvasControlButton({
  icon: Icon,
  label,
  shortcut,
  onClick,
  disabled,
}: {
  icon: ComponentType<{ "aria-hidden": true; className?: string }>;
  /** The accessible name, and the first half of the hover hint. */
  label: string;
  /** The keys that run the same action, when it has any. */
  shortcut?: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className="rounded-full"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={shortcut ? `${label} (${shortcut})` : label}
    >
      <Icon aria-hidden className="size-4" />
    </Button>
  );
}
