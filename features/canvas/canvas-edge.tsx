"use client";

import { useHistory } from "@liveblocks/react/suspense";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  useReactFlow,
  type EdgeProps,
  type EdgeTypes,
} from "@xyflow/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import {
  CANVAS_EDGE_CORNER_RADIUS,
  CANVAS_EDGE_INTERACTION_WIDTH,
  CANVAS_EDGE_STROKE,
  canvasEdgeOpacity,
  canvasEdgeStrokeWidths,
} from "@/features/canvas/canvas-edge-tokens";
import type {
  CanvasEdge as CanvasEdgeType,
  CanvasNode,
} from "@/types/canvas";

/**
 * The renderer for the one custom edge type, `canvasEdge`.
 *
 * A connection between two components: a right-angled line with an arrowhead at
 * the end the user dragged to, and an optional label sitting on it. There is one
 * edge model and one appearance — a relationship *type*, and a colour or a style
 * per type, are later units, and adding them now would mean inventing
 * architectural semantics neither product has been specified to have (invariant 7).
 *
 * Everything it is drawn with comes from `canvas-edge-tokens.ts`, so this file
 * holds no stroke, no dimension, and no colour of its own.
 */
function CanvasEdgeRenderer({
  id,
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  data,
  selected,
  markerEnd,
  interactionWidth,
  style,
}: EdgeProps<CanvasEdgeType>) {
  /*
   * The path, and the point on it a label belongs at. Both come out of
   * `getSmoothStepPath` together: the label position is the middle of the path as
   * the router itself computed it, so it stays on the line through every corner a
   * right-angled route takes. Working the midpoint out here from the endpoints
   * would put a label off the line as soon as the route was not a straight one.
   */
  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: CANVAS_EDGE_CORNER_RADIUS,
  });

  /*
   * Whether the pointer is over the connection. Local React state, like every other
   * hover: it is neither in Liveblocks Storage — a room's document is the diagram,
   * not what somebody's cursor is near — nor in Presence.
   */
  const [isHovered, setIsHovered] = useState(false);
  const labelEditor = useCanvasEdgeLabelEditor(id);

  /* A missing label reads as an empty one, so an edge stored before this unit works. */
  const label = data?.label ?? "";
  const isActive = selected === true || isHovered || labelEditor.isOpen;

  return (
    <>
      {/*
       * The group exists for two reasons, and both are about pointer events rather
       * than about grouping.
       *
       * `BaseEdge` puts the props it is given on the *visible* path only, which is
       * a thin line and an unreasonable thing to ask anyone to double-click, while
       * the wide invisible one it draws alongside takes none of them. Wrapping both
       * means a double-click or a hover anywhere in the wide band reaches this
       * handler, because React bubbles the event up out of whichever path it landed
       * on.
       *
       * `nopan` is what stops that double-click from also zooming the canvas in.
       * React Flow's zoom is a d3 listener on an element below React's own root, so
       * it runs *before* any handler here and a synthetic `stopPropagation` would
       * be too late; d3's filter rejects events inside `nopan` instead, which
       * covers the double-click and a drag along the line alike.
       */}
      <g
        className="nopan"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDoubleClick={labelEditor.onOpen}
      >
        <BaseEdge
          path={path}
          /*
           * The arrowhead React Flow generated from the edge defaults, passed
           * straight through — a custom edge is handed the marker's URL and has to
           * put it on the path itself.
           */
          markerEnd={markerEnd}
          /*
           * The invisible band that makes the line easy to hit. Taken from the edge
           * when it carries one, so a future per-edge value is honoured, and
           * otherwise the shared default.
           */
          interactionWidth={interactionWidth ?? CANVAS_EDGE_INTERACTION_WIDTH}
          style={{
            stroke: CANVAS_EDGE_STROKE,
            /*
             * Weight and opacity together, so an active connection is not
             * distinguished by brightness alone: it is dimmed at rest and comes up
             * to full strength, slightly heavier, when hovered or selected.
             * `opacity` rather than `stroke-opacity` is what carries the arrowhead
             * with the line.
             */
            strokeWidth: isActive
              ? canvasEdgeStrokeWidths.active
              : canvasEdgeStrokeWidths.rest,
            opacity: isActive ? canvasEdgeOpacity.active : canvasEdgeOpacity.rest,
            strokeLinecap: "round",
            /*
             * An inline style, because `base.css` styles the path through
             * `.react-flow__edge-path` and restyles it again when the edge is
             * selected. The edge's own `style` comes last so a value set on the edge
             * still wins over these.
             */
            ...style,
          }}
        />
      </g>

      <CanvasEdgeLabel
        label={label}
        labelX={labelX}
        labelY={labelY}
        selected={selected === true}
        labelEditor={labelEditor}
      />
    </>
  );
}

/**
 * What sits on the middle of a connection: its label, a hint that it could have
 * one, or the editor for it.
 *
 * It is drawn through `EdgeLabelRenderer`, which portals into a `<div>` layer over
 * the edges, rather than as SVG text — a pill with a border, a background, and an
 * input inside it is HTML, and React Flow's own SVG edge label cannot be either of
 * the last two.
 *
 * Presentational apart from the editing session it is handed: the label text is the
 * collaborative value on the edge, so there is no second copy of it here.
 */
function CanvasEdgeLabel({
  label,
  labelX,
  labelY,
  selected,
  labelEditor,
}: {
  label: string;
  /** The point on the path the router itself reported as its middle. */
  labelX: number;
  labelY: number;
  selected: boolean;
  labelEditor: CanvasEdgeLabelEditor;
}) {
  /*
   * Nothing at all on an unselected connection with no label. A canvas of unlabelled
   * connections should not be a canvas of hints.
   */
  if (!labelEditor.isOpen && label === "" && !selected) {
    return null;
  }

  return (
    <EdgeLabelRenderer>
      {/*
       * Centred on the path's own label position: the two translations are React
       * Flow's documented pairing — the first takes the box back by half its own
       * size, which is not known here, and the second moves it to the point.
       *
       * `pointer-events-auto` is needed because the label layer sets
       * `pointer-events: none` on itself, so that the edges underneath it stay
       * clickable; anything meant to be interacted with has to ask for events back.
       * `nodrag` and `nopan` then keep those interactions off the canvas — without
       * them a press on the label would pan the canvas and a double-click on it
       * would zoom, for the same d3 reason the edge group gives.
       */}
      <div
        className="nodrag nopan pointer-events-auto absolute"
        style={{
          transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
        }}
      >
        {labelEditor.isOpen ? (
          <Input
            /*
             * The field grows with what is typed — `field-sizing-content` with a
             * floor, so an empty label is still wide enough to aim at — and takes
             * the pill's own shape, so opening the editor does not change the size
             * or position of what was there. Most of the primitive's box styling is
             * overridden for that: its fixed height, full width, radius, padding,
             * and dark background all belong to a form field on a panel, and this
             * one has to look like a badge on a line. `select-text` is because the
             * label layer disables text selection.
             */
            className="field-sizing-content h-auto w-auto min-w-20 rounded-full border-border bg-card px-2 py-0.5 text-center text-xs font-medium shadow-sm select-text md:text-xs dark:bg-card"
            /*
             * The editor opens from a double-click and is the only thing the user can
             * mean by it, so it takes focus on mount. Focus is the browser's — no
             * state here mirrors it.
             */
            autoFocus
            /*
             * The value is the collaborative label, not a local draft: every
             * keystroke goes straight to the edge's data, so the room sees the label
             * as it is typed and there is nothing here that can fall out of step
             * with Storage. It is also what initialises the field from the label the
             * connection already had.
             */
            value={label}
            placeholder="Label this connection"
            aria-label="Connection label"
            onChange={(event) => labelEditor.onChange(event.target.value)}
            /*
             * Blur ends the session, which covers clicking the canvas, another edge,
             * or anything else outside this one.
             */
            onBlur={labelEditor.onClose}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                /* A label is one line; Enter commits it rather than inserting one. */
                event.preventDefault();
                labelEditor.onClose();
                return;
              }

              if (event.key === "Escape") {
                /*
                 * Escape closes the editor and nothing else. It restores no earlier
                 * label: every keystroke is already in the collaborative document and
                 * has been seen by the rest of the room, so there is no local draft to
                 * discard and undo is what takes a label back.
                 *
                 * The event is stopped so it does not also reach the canvas, which
                 * reads Escape as cancelling what is in progress there.
                 */
                event.stopPropagation();
                labelEditor.onClose();
              }
            }}
          />
        ) : (
          <button
            type="button"
            /*
             * A button, not a `<div>`: it is the target of a gesture, so it needs to
             * be reachable and to carry an accessible name. The double-click is taken
             * on the whole badge rather than on the text, so a connection whose label
             * is empty can still be labelled — there would be nothing to aim at
             * otherwise.
             */
            onDoubleClick={(event) => {
              /*
               * The edge's own double-click handler would open the same session, so
               * stopping here keeps one gesture to one call rather than relying on
               * the two being idempotent.
               */
              event.stopPropagation();
              labelEditor.onOpen();
            }}
            aria-label={
              label === "" ? "Label this connection" : `Connection label: ${label}`
            }
            className={
              label === ""
                ? /*
                   * A selected connection with no label says so faintly, in a dashed
                   * outline rather than the solid one a real label has, so it reads
                   * as an invitation rather than as an empty value.
                   */
                  "cursor-pointer rounded-full border border-dashed border-border bg-card/80 px-2 py-0.5 text-xs text-muted-foreground opacity-70 backdrop-blur transition-opacity hover:opacity-100"
                : /*
                   * The same floating surface as the rest of the canvas overlays — a
                   * bordered pill on `--card` with a shadow and a blur — so a label
                   * sitting on a line reads as the same kind of thing as the toolbars.
                   */
                  "cursor-pointer rounded-full border border-border bg-card/95 px-2 py-0.5 text-xs font-medium text-foreground shadow-sm backdrop-blur"
            }
          >
            {label === "" ? "Add label" : label}
          </button>
        )}
      </div>
    </EdgeLabelRenderer>
  );
}

/**
 * One connection's inline label editing session.
 *
 * The same shape as the node label editor in `canvas-node.tsx`, and deliberately
 * so — a label is edited the same way on a component and on a connection.
 *
 * **Whether the editor is open is local to this browser.** It is `useState` here
 * and reaches neither Liveblocks Storage — a room's document is the diagram, not
 * who is midway through labelling part of it — nor Presence, nor Prisma. Focus is
 * not tracked either; the browser owns it.
 *
 * **The label itself is not held here.** A keystroke goes straight to the edge's
 * `data` through React Flow's `updateEdgeData`, which diffs the edge and hands
 * `onEdgesChange` a `replace` change — the existing collaborative edge flow, which
 * is the Liveblocks mutation — so the text on screen is the collaborative value
 * being typed and the whole room sees it as it is typed. There is no second edge
 * store and no second path by which an edge changes.
 *
 * **A whole session is one entry in the undo history**, because Liveblocks history
 * is paused while the editor is open and resumed when it closes, so a run of
 * keystrokes commits as one frame and one undo takes the label back to what it was
 * before the session rather than back by one character.
 */
function useCanvasEdgeLabelEditor(edgeId: string): CanvasEdgeLabelEditor {
  const { updateEdgeData } = useReactFlow<CanvasNode, CanvasEdgeType>();
  const history = useHistory();
  const [isOpen, setIsOpen] = useState(false);

  /*
   * `pause()` and `resume()` are not counted by Liveblocks, and a `resume()` with
   * nothing paused would commit whatever *another* pause is holding — a node resize
   * gesture pauses the same history. So this tracks whether the pause is ours before
   * resuming, which is what makes the cleanup below safe to run on every unmount.
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
      updateEdgeData(edgeId, { label });
    },
    [edgeId, updateEdgeData]
  );

  /*
   * The editor can go away without closing itself: the connection is deleted, one of
   * the components it joins is removed by somebody else in the room, or the canvas
   * unmounts while the input still has focus — none of which fire a blur this
   * component is still around to handle. Leaving history paused then would swallow
   * every later change into one frame nothing ever commits, so the cleanup resumes
   * it. It runs on unmount only, and does nothing unless this session is the one
   * holding the pause.
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
 * The editing session, driven from outside the label component.
 *
 * Callbacks and a flag, with no label of its own: the text being edited is the
 * collaborative value on the edge, so nothing in here is a second copy of it.
 */
interface CanvasEdgeLabelEditor {
  /** Whether the editor is open in place of the label. */
  isOpen: boolean;
  /** The connection or its label area was double-clicked. */
  onOpen: () => void;
  /** A keystroke. Called with the whole new label, not a diff. */
  onChange: (label: string) => void;
  /** The editor lost focus, or `Enter` or `Escape` was pressed. */
  onClose: () => void;
}

/**
 * The `edgeTypes` map React Flow is given.
 *
 * Defined at module scope, not inside the canvas component, for the reason
 * `canvasNodeTypes` is: React Flow re-registers on a new object identity, so an
 * inline literal would remount every edge on each render of the canvas.
 */
export const canvasEdgeTypes: EdgeTypes = {
  canvasEdge: CanvasEdgeRenderer,
};
