import { MarkerType, type DefaultEdgeOptions, type EdgeMarker } from "@xyflow/react";

/**
 * The shared token map for canvas connections, the sibling of
 * `canvas-node-tokens.ts`.
 *
 * `ui-context.md` requires that what the canvas is drawn with lives in a shared
 * map rather than inside individual components, so the edge renderer reads every
 * stroke, opacity, dimension, and marker from here and holds none of them.
 * Connections get their own file rather than joining the node map because they are
 * a separate responsibility: nothing here is a node measurement and nothing there
 * is a stroke.
 *
 * Every colour resolves to the palette in `app/globals.css`, so no literal colour
 * appears. Nothing here says anything about *what* a connection means: a
 * relationship type — invokes, uses, reads, writes — is a later unit, so there is
 * one stroke and one arrowhead for every edge rather than a per-type style
 * (invariant 7).
 */

/**
 * The one colour a connection is drawn in, arrowhead included.
 *
 * `--muted-foreground` is light against the dark canvas without competing with a
 * component's label, which is `--foreground`. There is deliberately no second
 * colour for the hovered or selected state: brightening is opacity and weight, so
 * the arrowhead — whose colour is baked into an SVG marker definition shared by
 * every edge — cannot fall out of step with the line it ends.
 */
export const CANVAS_EDGE_STROKE = "var(--muted-foreground)";

/**
 * How thickly a connection is stroked, in canvas units.
 *
 * The heavier weight is the second channel of the hovered and selected state, so
 * an active connection does not read as active by brightness alone
 * (`ui-context.md`). It is also what scales the arrowhead: React Flow renders a
 * marker with `markerUnits="strokeWidth"`, so the arrow grows with the line
 * rather than staying a fixed size beside a thicker stroke.
 */
export const canvasEdgeStrokeWidths = {
  /** Subtle at rest: a diagram is read by its components first. */
  rest: 1.5,
  /** Hovered or selected. */
  active: 2,
} as const;

/**
 * How opaque a connection is.
 *
 * The dimming is `opacity` on the path rather than `stroke-opacity`, which is
 * load-bearing: a marker is painted as part of the path's own rendering, so
 * `opacity` carries the arrowhead with the line while `stroke-opacity` would fade
 * the line and leave the arrow at full strength.
 */
export const canvasEdgeOpacity = {
  rest: 0.55,
  active: 1,
} as const;

/**
 * The radius the right-angle corners of a connection are rounded by, in canvas
 * units.
 *
 * Routing is right-angled — `getSmoothStepPath` — and this only softens the turn,
 * so the path still reads as horizontal and vertical runs rather than as a curve.
 */
export const CANVAS_EDGE_CORNER_RADIUS = 8;

/**
 * The width of the invisible band around a connection that takes pointer events,
 * in canvas units.
 *
 * This is how a connection becomes easy to click, hover, and double-click
 * **without** thickening the line: React Flow's `BaseEdge` draws a second,
 * fully transparent path along the same geometry at this width, so only the hit
 * area grows. React Flow's own default is 20; a little wider suits a canvas whose
 * lines are thin and are also the target of a double-click.
 */
export const CANVAS_EDGE_INTERACTION_WIDTH = 24;

/**
 * The arrowhead at the target end of a connection.
 *
 * A closed arrow rather than an open one: it reads as a direction at the small
 * sizes a diagram is usually viewed at. There is no marker at the source end —
 * one arrow is what makes the direction unambiguous.
 */
export const canvasEdgeMarkerEnd: EdgeMarker = {
  type: MarkerType.ArrowClosed,
  width: 16,
  height: 16,
  color: CANVAS_EDGE_STROKE,
};

/**
 * What a new connection resolves to, handed to `<ReactFlow>` as
 * `defaultEdgeOptions`.
 *
 * These are **React Flow's own edge defaults**, not values copied onto each edge
 * as it is created, and using them does two things at once. React Flow merges
 * this object into the connection before `onConnect` runs, so a new edge is a
 * `canvasEdge` with an empty label without the drop path knowing either fact; and
 * it merges the same object under every edge at render, so a connection stored
 * before this unit existed — with no `type` and no arrowhead — is drawn the same
 * way as one made today.
 *
 * `markerEnd` has to be here rather than in the renderer: React Flow generates
 * the SVG `<marker>` definitions from the edges and from this object, so an
 * arrowhead the renderer asked for on its own would have nothing to point at. The
 * stroke, the opacity, and the interaction width are **not** here, because they
 * belong to the renderer — the first two change with hover and selection, which a
 * static default cannot express.
 *
 * The object identity is fixed at module scope. React Flow keeps it in its store
 * and memoises the marker definitions on it, so a fresh literal every render would
 * rebuild them each time.
 */
export const canvasEdgeDefaults: DefaultEdgeOptions = {
  type: "canvasEdge",
  /*
   * An empty label, so a new connection carries the same field an old one is read
   * with rather than an absent one. The renderer treats a missing label as empty
   * anyway, which is what keeps an edge stored before this unit compatible.
   */
  data: { label: "" },
  markerEnd: canvasEdgeMarkerEnd,
};
