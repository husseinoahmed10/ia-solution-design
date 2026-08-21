"use client";

import { useHistory } from "@liveblocks/react/suspense";
import {
  Handle,
  NodeResizer,
  NodeToolbar,
  Position,
  useReactFlow,
  type NodeProps,
  type NodeTypes,
} from "@xyflow/react";
import { Check } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { CanvasNodeBody } from "@/features/canvas/canvas-node-body";
import {
  DEFAULT_CANVAS_NODE_COLOR,
  canvasNodeColorTokens,
  canvasNodeColors,
  canvasNodeHandleStyle,
  canvasNodeResizeControlStyles,
  canvasNodeShapeTokens,
  canvasNodeStrokeWidths,
  canvasNodeToolbarOffset,
} from "@/features/canvas/canvas-node-tokens";
import { cn } from "@/lib/utils";
import type {
  CanvasNodeColor,
  CanvasNodeHandleId,
  CanvasNode as CanvasNodeType,
} from "@/types/canvas";

/**
 * The four sides a connection can be made from, and the handle ID each one is
 * stored under.
 *
 * The IDs are **side-based and stable**, because they are part of the
 * collaborative document: an edge in Liveblocks Storage records which handle each
 * of its ends is attached to, and React Flow routes the connection from that
 * handle's side. Renaming one would detach every existing connection, so the four
 * names are the `CanvasNodeHandleId` union in `types/canvas.ts` — which is also
 * what a starter template's edges are typed by, so a template cannot name a side
 * this node does not declare.
 *
 * Every handle is declared `type="source"`, which is not a direction: the canvas
 * runs in `ConnectionMode.Loose`, where React Flow looks an edge's target end up
 * in the source *and* target handles of a node and accepts a drag between any two
 * distinct handles. Declaring a side a source or a target would be the strict
 * source/target semantics an architecture diagram should not have — a connection
 * is drawn in whichever direction the user drags — so all four are alike and the
 * arrowhead follows the drag rather than the sides.
 */
const canvasNodeHandles: readonly {
  id: CanvasNodeHandleId;
  position: Position;
}[] = [
  { id: "top", position: Position.Top },
  { id: "right", position: Position.Right },
  { id: "bottom", position: Position.Bottom },
  { id: "left", position: Position.Left },
];

/**
 * The renderer for the one custom node type, `canvasNode`.
 *
 * A basic component: the shape it maps to, a border, and a centred label, all of
 * which come from `CanvasNodeBody` — the same appearance the toolbar's drag
 * preview draws, so what is dragged and what lands cannot diverge. There is no
 * property editing beyond the label, no icon, and no stage or action detail —
 * those are later units, and drawing them now would mean inventing WorkHQ and
 * Design Studio behaviour (invariant 7).
 *
 * What this component adds around that appearance is what belongs to a node
 * rather than to a shape: React Flow's measured size, its selected state, the four
 * connection handles, the resize controls, the inline label editing session, and
 * the floating colour toolbar.
 *
 * The data fields are read defensively. `shape` and `color` are optional on
 * `CanvasNodeData`, and the node being rendered may have been written to Storage by
 * an older version of this application in a tab that is still open, so each falls
 * back to a default rather than rendering nothing.
 */
function CanvasNodeRenderer({
  id,
  data,
  width,
  height,
  selected,
}: NodeProps<CanvasNodeType>) {
  const shape = data.shape ?? "rectangle";
  const color = data.color ?? DEFAULT_CANVAS_NODE_COLOR;
  const shapeTokens = canvasNodeShapeTokens[shape];

  /*
   * React Flow puts the node's own `width` and `height` on the wrapper as inline
   * styles and passes the measured values here, but the first render of a new node
   * happens before it has been measured. The shape needs numbers to lay its
   * geometry out, so the shape's default size stands in until the measurement
   * arrives.
   */
  const drawnWidth = width ?? shapeTokens.defaultWidth;
  const drawnHeight = height ?? shapeTokens.defaultHeight;

  const labelEditor = useCanvasNodeLabelEditor(id);
  const changeColor = useCanvasNodeColor(id);

  return (
    /*
     * `group` is here for the connection handles below, which fade in when the node
     * is hovered. It sits on this wrapper rather than on React Flow's own node
     * element because that element is not ours to add a class to, and the handles
     * are positioned against this one anyway.
     */
    <div className="group relative size-full">
      {/*
       * The colour toolbar. It belongs here rather than in `CanvasNodeBody`,
       * because it is node behaviour — it changes the node's data and it reacts to
       * the node's selected state — and because the body is shared with the drag
       * preview, which has no node to recolour.
       *
       * `isVisible` is the selected flag, so the swatches appear with the selected
       * outline and the resize controls and a canvas of unselected components
       * carries no toolbars at all. **Whether it is showing is not stored
       * anywhere**: it is React Flow's own selected state and nothing else, so it
       * reaches neither Liveblocks Storage — a room's document is the diagram, not
       * who has clicked on part of it — nor Presence, nor Prisma. Only the colour
       * a swatch produces is collaborative.
       */}
      <NodeToolbar
        isVisible={selected}
        position={Position.Top}
        offset={canvasNodeToolbarOffset}
      >
        <CanvasNodeColorSwatches
          activeColor={color}
          onSelectColor={changeColor}
        />
      </NodeToolbar>

      {/*
       * Resizing. `NodeResizer` is React Flow's own, so the width and height it
       * produces travel the route every other change does — a `dimensions` change
       * to `onNodesChange`, which is the Liveblocks handler — and end up on the
       * node in Storage. There is no second copy of a node's size anywhere: the
       * shape below is drawn from the measurement React Flow passes back in.
       *
       * `isVisible` is the selected flag, so the controls appear with the selected
       * outline and a canvas of unselected components carries no handles at all.
       *
       * There is deliberately **no history handling here.** The Liveblocks React
       * Flow integration already pauses history when a `dimensions` change arrives
       * with `resizing: true` and resumes it on `resizing: false`, so a drag is one
       * undo step; pausing it again from here would nest a pause it never balanced.
       */}
      <NodeResizer
        isVisible={selected}
        /* The floors are the shape's own, from the shared token map. */
        minWidth={shapeTokens.minWidth}
        minHeight={shapeTokens.minHeight}
        /*
         * A circle stays a circle. Its default size is square, so locking the
         * aspect ratio at the start of the gesture locks it at 1:1 — and the SVG
         * is an `ellipse`, so any other shape keeps scaling freely on both axes.
         */
        keepAspectRatio={shape === "circle"}
        handleStyle={canvasNodeResizeControlStyles.handle}
        lineStyle={canvasNodeResizeControlStyles.line}
      />

      <CanvasNodeBody
        label={data.label}
        shape={shape}
        color={color}
        width={drawnWidth}
        height={drawnHeight}
        selected={selected}
        labelEditor={labelEditor}
      />

      {/*
       * One connection handle per side, so a component can be joined to another in
       * whichever direction the diagram reads. `base.css` positions a handle but
       * gives it no size or colour of its own — those rules live in the `style.css`
       * this project does not import — so both come from the shared token map.
       *
       * Every handle **stays mounted whether or not it can be seen.** React Flow
       * measures the handles of a node to work out where an edge starts and ends, so
       * a handle removed from the tree, or hidden with `display: none`, has no
       * measured box and the connections attached to it lose their endpoints. The
       * fade is therefore opacity alone: faint at rest so a canvas of components is
       * not a field of dots, and full strength as soon as the node is hovered or
       * selected, which is when a connection is about to be drawn.
       */}
      {canvasNodeHandles.map(({ id: handleId, position }) => (
        <Handle
          key={handleId}
          id={handleId}
          type="source"
          position={position}
          style={canvasNodeHandleStyle}
          className={cn(
            "transition-opacity",
            selected ? "opacity-100" : "opacity-40 group-hover:opacity-100"
          )}
        />
      ))}
    </div>
  );
}

/**
 * The row of predefined colour swatches inside the floating toolbar.
 *
 * Presentational: it is given the node's current colour and a callback, and holds
 * no state of its own — which colour is active is the collaborative value on the
 * node, so there is no second local copy of it here to fall out of step.
 *
 * Every swatch is drawn from the shared token map, so this component contains no
 * colour and no list of colours: `canvasNodeColors` is derived from the map, so a
 * theme added there becomes a swatch with no change to this file.
 */
function CanvasNodeColorSwatches({
  activeColor,
  onSelectColor,
}: {
  activeColor: CanvasNodeColor;
  onSelectColor: (color: CanvasNodeColor) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Component colour"
      /*
       * The same floating-surface treatment as the component toolbar at the bottom
       * of the canvas — a bordered pill on the panel colour with a shadow — so the
       * two read as the same kind of thing rather than as two different overlays.
       *
       * `nodrag`, `nopan`, and `nowheel` are what keep the toolbar's own gestures
       * off the canvas underneath it. They are needed because `NodeToolbar`
       * portals into `.react-flow__renderer`, which is the element d3-zoom is
       * bound to, so without them a press on a swatch would also pan the canvas, a
       * double click would zoom it, and a scroll over the pill would zoom too. A
       * synthetic `stopPropagation` could not do this: d3's listeners sit below
       * React's root and its filter rejects events inside these classes instead.
       *
       * Node dragging is a separate matter and already safe — the toolbar is
       * portalled out of the node wrapper, so a press on it never reaches the
       * node's own drag handler — but `nodrag` is on it anyway, so the guarantee
       * does not depend on where React Flow chooses to portal it.
       */
      className="nodrag nopan nowheel flex items-center gap-1 rounded-full border border-border bg-card/95 p-1.5 shadow-lg backdrop-blur"
    >
      {canvasNodeColors.map((color) => (
        <ColorSwatchButton
          key={color}
          color={color}
          isActive={color === activeColor}
          onSelect={onSelectColor}
        />
      ))}
    </div>
  );
}

/**
 * One swatch: the colour it applies, drawn in that colour.
 *
 * The swatch shows the node's own surface and border rather than a flat block of
 * the hue, so what is being chosen is what will appear on the canvas.
 *
 * **The active swatch is marked in three ways, not one.** It carries a tick, it
 * is outlined in the selected border colour, and that outline is at the heavier of
 * the two node stroke weights — so it is identifiable without relying on colour
 * (`ui-context.md`), and `aria-pressed` says the same thing to a screen reader.
 * The weights are the node's own, from the shared map, rather than new numbers.
 *
 * The hover effect is a slight lift in brightness. On a dark tinted surface that
 * is a subtle change rather than a highlight competing with the selected outline
 * next to it, and it needs no second set of hover colours in the token map.
 */
function ColorSwatchButton({
  color,
  isActive,
  onSelect,
}: {
  color: CanvasNodeColor;
  isActive: boolean;
  onSelect: (color: CanvasNodeColor) => void;
}) {
  const { name, surface, border, selectedBorder, labelColor } =
    canvasNodeColorTokens[color];

  return (
    <button
      type="button"
      onClick={() => onSelect(color)}
      aria-pressed={isActive}
      /*
       * The colour is the only thing this control shows, and a colour has no
       * accessible name of its own, so the name from the token map is both the
       * accessible name and the hover hint.
       */
      aria-label={name}
      title={name}
      className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full border-solid transition-[filter] outline-none hover:brightness-150 focus-visible:ring-3 focus-visible:ring-ring/50"
      /*
       * Inline styles, because these are the token map's colour strings — the same
       * ones the node's SVG is filled and stroked with — and because a border
       * width from the map cannot be a class either.
       */
      style={{
        backgroundColor: surface,
        borderColor: isActive ? selectedBorder : border,
        borderWidth: isActive
          ? canvasNodeStrokeWidths.selected
          : canvasNodeStrokeWidths.rest,
      }}
    >
      {isActive ? (
        <Check aria-hidden className="size-3.5" style={{ color: labelColor }} />
      ) : null}
    </button>
  );
}

/**
 * Changes one node's colour.
 *
 * The colour goes to the node's `data` through React Flow's `updateNodeData`,
 * which is the route the label already takes: it diffs the node and hands
 * `onNodesChange` a `replace` change, and that handler is the Liveblocks
 * mutation — so the new colour is in Storage and on every collaborator's screen
 * immediately, with **no server API call**, no route, and no Prisma write. A
 * canvas lives in the Liveblocks document alone.
 *
 * **Only `color` is written.** The label, the shape, the component type, the
 * position, and the size are left exactly as they are, and no copy of the colour
 * is kept here — the active swatch is read back from the node's own data, so
 * there is only ever one colour for a node.
 *
 * There is no history handling, unlike the label editor: one click is one
 * complete change, so it is already one undo step and pausing anything around it
 * would only risk unbalancing a pause a resize gesture owns.
 */
function useCanvasNodeColor(nodeId: string) {
  const { updateNodeData } = useReactFlow();

  return useCallback(
    (color: CanvasNodeColor) => {
      updateNodeData(nodeId, { color });
    },
    [nodeId, updateNodeData]
  );
}

/**
 * Holds one node's inline label editing session.
 *
 * **Whether the editor is open is local to this browser**, and only that: it is
 * `useState` here and reaches neither Liveblocks Storage — a room's document is
 * the diagram, not who is midway through renaming part of it — nor Presence, which
 * this unit still does not write, nor Prisma, which holds no canvas state at all.
 * Focus is not tracked either; the browser owns it, and mirroring it would be a
 * second copy of something already true of the DOM.
 *
 * **The label itself is not held here.** A keystroke goes straight to the node's
 * `data` through React Flow's `updateNodeData`, which diffs the node and hands
 * `onNodesChange` a `replace` change — the same handler a drag or a resize goes
 * through, which is the Liveblocks mutation — so the text on screen is the
 * collaborative value being typed and everybody in the room sees it as it is
 * typed. A local draft synced on commit would be the second copy of node state
 * that `useLiveblocksFlow` exists to avoid, and it is also why `Escape` has
 * nothing to revert.
 *
 * **A whole session is one entry in the undo history.** Liveblocks history is
 * paused while the editor is open and resumed when it closes, so the run of
 * keystrokes commits as a single frame and one undo takes the label back to what
 * it was before the session — rather than one undo per character.
 */
function useCanvasNodeLabelEditor(nodeId: string) {
  const { updateNodeData } = useReactFlow();
  const history = useHistory();
  const [isOpen, setIsOpen] = useState(false);

  /*
   * `pause()` and `resume()` are not counted by Liveblocks — resuming twice
   * commits the paused frame and then commits nothing — but they are also not
   * idempotent in the other direction: a `resume()` with nothing paused would
   * commit whatever *another* pause is holding, and a resize gesture pauses the
   * same history. So this tracks whether the pause is ours before resuming, which
   * is what makes the cleanup below safe to run on every unmount.
   */
  const hasPausedHistory = useRef(false);

  const resumeHistory = useCallback(() => {
    if (!hasPausedHistory.current) {
      return;
    }

    hasPausedHistory.current = false;
    history.resume();
  }, [history]);

  const open = useCallback(() => {
    if (!hasPausedHistory.current) {
      hasPausedHistory.current = true;
      history.pause();
    }

    setIsOpen(true);
  }, [history]);

  const close = useCallback(() => {
    setIsOpen(false);
    resumeHistory();
  }, [resumeHistory]);

  const changeLabel = useCallback(
    (label: string) => {
      updateNodeData(nodeId, { label });
    },
    [nodeId, updateNodeData]
  );

  /*
   * The editor can go away without closing itself: the node is deleted, the
   * component is removed by somebody else in the room, or the canvas unmounts
   * while the textarea still has focus — none of which fire a blur that this
   * component is still around to handle. Leaving history paused then would swallow
   * every later change into one frame that nothing ever commits, so the cleanup
   * resumes it. It runs on unmount only, and does nothing unless this session is
   * the one holding the pause.
   */
  useEffect(() => resumeHistory, [resumeHistory]);

  return {
    isOpen,
    onOpen: open,
    onChange: changeLabel,
    onClose: close,
  };
}

/**
 * The `nodeTypes` map React Flow is given.
 *
 * Defined at module scope, not inside the canvas component: React Flow warns about
 * — and re-registers on — a new object identity every render, so an inline literal
 * would remount every node on each render of the canvas.
 */
export const canvasNodeTypes: NodeTypes = {
  canvasNode: CanvasNodeRenderer,
};
