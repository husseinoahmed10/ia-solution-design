"use client";

import { Textarea } from "@/components/ui/textarea";
import { CanvasNodeShapeOutline } from "@/features/canvas/canvas-node-shape";
import {
  canvasNodeColorTokens,
  canvasNodeShapeTokens,
} from "@/features/canvas/canvas-node-tokens";
import { cn } from "@/lib/utils";
import type { CanvasNodeColor, CanvasNodeShape } from "@/types/canvas";

/**
 * What a canvas component looks like: the shape outline with its label centred
 * over it, filling the box it is given.
 *
 * This is the node's appearance and nothing else — no handles, no selection
 * click, no position. It is shared by the two places a component is drawn: the
 * `canvasNode` renderer on the canvas, and the ghost that follows the cursor
 * while a component is being dragged out of the toolbar. The drag preview shows
 * what will actually land, so it must not be a second drawing of the same thing
 * that can drift from the first.
 *
 * The outline itself is unchanged — this composes
 * `CanvasNodeShapeOutline`, it does not replace it.
 */
interface CanvasNodeBodyProps {
  label: string;
  shape: CanvasNodeShape;
  color: CanvasNodeColor;
  /** The drawn size in canvas units, which the outline lays its geometry out in. */
  width: number;
  height: number;
  /**
   * Whether to draw the selected outline. The ghost preview is never selected —
   * nothing has been created yet for a user to have selected.
   */
  selected: boolean;
  /**
   * How the label is edited in place, when it can be. Absent on the drag preview:
   * there is no node to rename until the component has been dropped.
   */
  labelEditor?: CanvasNodeLabelEditor;
}

/**
 * The label editing session, driven from outside this component.
 *
 * The four members are all callbacks or a flag — no label of their own. The text
 * being typed is the `label` prop, which comes from the collaborative node data,
 * so this component holds no second copy of it and neither does its caller. What
 * belongs here is only the *appearance* of editing; when a session starts and
 * where the typed text goes are node behaviour, and they stay in
 * `canvas-node.tsx`.
 */
export interface CanvasNodeLabelEditor {
  /** Whether the editor is open in place of the label. */
  isOpen: boolean;
  /** The label area was double-clicked. */
  onOpen: () => void;
  /** A keystroke. Called with the whole new label, not a diff. */
  onChange: (label: string) => void;
  /** The editor lost focus, or `Escape` was pressed. */
  onClose: () => void;
}

export function CanvasNodeBody({
  label,
  shape,
  color,
  width,
  height,
  selected,
  labelEditor,
}: CanvasNodeBodyProps) {
  const shapeTokens = canvasNodeShapeTokens[shape];
  const colorTokens = canvasNodeColorTokens[color];

  return (
    <div className="relative size-full">
      <CanvasNodeShapeOutline
        shape={shape}
        color={color}
        width={width}
        height={height}
        selected={selected}
      />

      {/*
       * The label sits above the outline in the same box. It is centred both ways
       * and clamped to two lines: a long component name should wrap rather than
       * spill outside a shape that cannot grow to hold it. The inset comes from
       * the shape, because the drawn outline is not the bounding box.
       *
       * The double-click that starts editing is taken on this whole area rather
       * than on the label text itself, so a component whose label is empty can
       * still be renamed — there would be nothing to aim at otherwise.
       *
       * `nopan` is what stops that double-click from also zooming the canvas in.
       * React Flow's zoom is a d3 listener on the pane *below* React's own root,
       * so a synthetic `stopPropagation` here would run too late to prevent it;
       * d3's filter rejects any event inside `nopan` instead, which covers the
       * double-click and a pan drag alike. It is added only where the label can be
       * edited, so the drag preview is untouched.
       */}
      <div
        className={cn(
          "relative flex size-full items-center justify-center text-center",
          labelEditor && "nopan",
          shapeTokens.labelClassName
        )}
        onDoubleClick={labelEditor?.onOpen}
      >
        {labelEditor?.isOpen ? (
          /*
           * The editor replaces the label in the *same* centred position rather
           * than being layered over it, so opening it neither shifts the text nor
           * shows it twice. `field-sizing-content` with `min-h-0` is what keeps it
           * centred: the box grows downward and upward from the middle as the text
           * wraps, where a textarea stretched to fill the shape would put the
           * first line against its top edge.
           *
           * Almost every one of the primitive's own box styles is overridden —
           * its border, padding, background, and minimum height all belong to a
           * form field on a panel, and this one has to look like a label on a
           * shape. The focus ring goes for the reason unit 13 gave for the
           * selected state: a ring is a rectangle, so it would sit around a
           * hexagon or a circle instead of on it. The caret and the node's own
           * selected outline are what show that editing is in progress.
           *
           * `nodrag` and `nopan` keep a click, a drag over the text, and a
           * selection from moving the node or panning the canvas underneath it.
           */
          <Textarea
            className="nodrag nopan field-sizing-content min-h-0 resize-none overflow-hidden rounded-none border-0 bg-transparent p-0 text-center text-sm font-medium shadow-none focus-visible:border-0 focus-visible:ring-0 dark:bg-transparent"
            /*
             * The editing text is the label's own colour, so opening the editor
             * does not change how the text looks — only that there is a caret in
             * it. An inline style rather than a class for the reason the token map
             * gives: the node's three colours are one mechanism, and the label's
             * is the same string the SVG fill and stroke are.
             */
            style={{ color: colorTokens.labelColor }}
            rows={1}
            value={label}
            placeholder="Name this component"
            aria-label="Component label"
            /*
             * The editor is opened by a pointer gesture and is the only thing the
             * user can mean by it, so it takes focus on mount rather than asking
             * for a second click. Focus is the browser's own — no state here
             * mirrors it.
             */
            autoFocus
            onChange={(event) => labelEditor.onChange(event.target.value)}
            /*
             * Blur closes the session, which covers clicking the canvas, another
             * node, or anything outside this one.
             */
            onBlur={labelEditor.onClose}
            onKeyDown={(event) => {
              if (event.key !== "Escape") {
                return;
              }

              /*
               * Escape closes the editor and nothing else. It does not restore a
               * previous label: every keystroke has already been written to the
               * collaborative document and seen by everyone else in the room, so
               * there is no local draft to throw away and undoing the rename is
               * what the history is for.
               */
              event.stopPropagation();
              labelEditor.onClose();
            }}
          />
        ) : (
          <span
            className="line-clamp-2 text-sm font-medium break-words"
            style={{ color: colorTokens.labelColor }}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
