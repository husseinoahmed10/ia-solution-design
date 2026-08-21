import type { CSSProperties } from "react";

import type { CanvasNodeColor, CanvasNodeShape } from "@/types/canvas";

/**
 * The one shared token map for canvas components.
 *
 * `ui-context.md` requires that canvas component colours and dimensions live in a
 * single map rather than inside individual components, so both the toolbar and the
 * node renderer read every value from here. A component that wants to look
 * different is a new entry in this file, not a class name added to a node.
 *
 * Nothing in here is a WorkHQ or Design Studio measurement. These are this
 * application's own drawing conventions for a high-level design (invariant 7).
 */

/**
 * How one shape is drawn and sized.
 *
 * The default size belongs to the **shape** rather than to the component, because
 * it is the shape that decides how much room a label needs: a circle has to hold
 * its text inside a curve, a hexagon loses both ends to its points. A component
 * therefore inherits the size of the shape it maps to, and the toolbar sends that
 * size in the drag payload.
 */
export interface CanvasNodeShapeTokens {
  /** Node width in canvas units. */
  defaultWidth: number;
  /** Node height in canvas units. */
  defaultHeight: number;
  /**
   * The smallest the node may be dragged to while resizing, in canvas units.
   *
   * Per-shape for the same reason the default size is: it is the shape that
   * decides how much room a label needs, so the floor under a hexagon — which
   * loses both ends to its points — is not the floor under a rectangle of the
   * same drawn width. Below these the outline stops reading as the shape it is
   * and the label has nowhere left to wrap.
   */
  minWidth: number;
  minHeight: number;
  /**
   * The inset the centred label sits behind. It is per-shape because the drawn
   * outline is not the bounding box: a hexagon's points and a diamond's corners
   * eat into the sides, so their labels need more horizontal room than a
   * rectangle's does.
   */
  labelClassName: string;
}

/**
 * Every shape the canvas can draw.
 *
 * Rectangles and pills are wider than they are tall, circles are square,
 * cylinders are wide enough for a label beneath their rim, and hexagons are a
 * little larger than the rest so the text between their points stays readable.
 *
 * `diamond` has no toolbar component yet. It is sized and styled anyway, so the
 * decision and branching components that will use it need no change here.
 *
 * The minimum is the floor a resize gesture stops at. `circle`'s is square, like
 * its default size, because a circle is resized with its aspect ratio locked and a
 * non-square floor would be a limit it could never reach.
 */
export const canvasNodeShapeTokens: Record<
  CanvasNodeShape,
  CanvasNodeShapeTokens
> = {
  rectangle: {
    defaultWidth: 180,
    defaultHeight: 72,
    minWidth: 96,
    minHeight: 48,
    labelClassName: "px-3 py-2",
  },
  pill: {
    defaultWidth: 200,
    defaultHeight: 64,
    minWidth: 112,
    minHeight: 40,
    labelClassName: "px-6 py-2",
  },
  circle: {
    defaultWidth: 96,
    defaultHeight: 96,
    minWidth: 64,
    minHeight: 64,
    labelClassName: "px-3.5",
  },
  cylinder: {
    defaultWidth: 168,
    defaultHeight: 100,
    minWidth: 112,
    /* Tall enough that the rim and the label beneath it both still fit. */
    minHeight: 72,
    /* Below the rim, not across it, so the label does not sit on the top ellipse. */
    labelClassName: "px-4 pt-7 pb-3",
  },
  hexagon: {
    defaultWidth: 184,
    defaultHeight: 104,
    /* Wider floor than a rectangle's: the points eat into both ends. */
    minWidth: 128,
    minHeight: 72,
    labelClassName: "px-9 py-3",
  },
  diamond: {
    defaultWidth: 144,
    defaultHeight: 144,
    /* The corners leave only the middle band for a label, so neither side goes far. */
    minWidth: 112,
    minHeight: 112,
    labelClassName: "px-8 py-8",
  },
};

/**
 * How thickly a node's outline is stroked, in canvas units.
 *
 * A dimension rather than a colour, so it belongs in this map with the rest of
 * them: the shape renderer reads both values from here and holds neither.
 *
 * The two differ because selection must not be **colour alone**
 * (`ui-context.md`): a selected component is drawn in the brighter selected
 * border *and* with a heavier stroke, so it reads as selected at a glance and
 * still reads as selected to somebody who cannot tell the two colours apart. The
 * weight is expressed here rather than as a CSS ring on the node wrapper, because
 * a ring is a rectangle — it would sit around a hexagon or a circle rather than
 * on it — while a stroke follows whatever outline the shape draws and scales with
 * the node like the rest of its geometry.
 */
export const canvasNodeStrokeWidths = {
  /** Subtle at rest: the outline separates a component from the canvas. */
  rest: 1.5,
  /** Clearly visible while selected. */
  selected: 2.5,
} as const;

/**
 * How the resize controls React Flow draws around a selected node look.
 *
 * They belong in this map with everything else a node is drawn with — a handle's
 * size is a dimension and its colour resolves to the palette, so neither may sit
 * in the renderer.
 *
 * These are **inline styles rather than classes**, which is the one thing in this
 * file that is not a Tailwind class or an SVG attribute value, and it is forced by
 * specificity: React Flow's `base.css` styles a control through
 * `.react-flow__resize-control.handle`, two classes, so a single utility class on
 * the same element loses to it and the handle would keep its hardcoded white
 * border and default fill. An inline style wins outright. The values are still
 * `var(--token)` references, so no literal colour appears here either.
 */
export interface CanvasNodeResizeControlTokens {
  /** The four corner handles, which are what a resize is dragged from. */
  handle: CSSProperties;
  /** The four edges between them. */
  line: CSSProperties;
}

/**
 * Subtle, and consistent with the rest of the dark canvas: a small hollow square
 * on the node's own surface, outlined in the same `--ring` the selected node is
 * stroked with, and edges in a mix of that colour rather than at full strength.
 * The controls appear only while a node is selected, so they read as part of the
 * selected outline instead of as a second, competing highlight.
 *
 * A touch larger than React Flow's own 5px, which is small enough to be awkward to
 * hit, and rounded a little rather than square-cornered to match the interface's
 * radius scale.
 */
export const canvasNodeResizeControlStyles: CanvasNodeResizeControlTokens = {
  handle: {
    width: 8,
    height: 8,
    borderRadius: 2,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "var(--ring)",
    backgroundColor: "var(--card)",
  },
  line: {
    borderColor: "color-mix(in oklab, var(--ring) 45%, transparent)",
  },
};

/**
 * How one of a node's four connection handles is drawn.
 *
 * A small white dot with a dark border, so it reads as a grabbable point on any of
 * the colour themes and against the canvas behind a shape's own outline.
 *
 * **Inline styles rather than Tailwind classes**, for the same reason the resize
 * controls above are, and it is worth being precise about the reason here because
 * it is not the one it looks like. `base.css` sets a handle's `background-color`
 * through `.react-flow__handle` — a single class, which a utility class would
 * normally tie with and win on source order — but Tailwind v4 emits its utilities
 * inside `@layer utilities`, and an unlayered declaration beats a layered one
 * whatever the order. So a `bg-*` class on a handle loses to `base.css` outright.
 * An inline style wins, and the values are still `var(--token)` references, so no
 * literal colour appears.
 *
 * How *visible* a handle is at rest is not here: it depends on whether the node is
 * hovered, which is a CSS state an inline style cannot express, so the fade is two
 * opacity classes on the handle instead. `base.css` sets no opacity on a handle,
 * so those classes have nothing to lose to.
 */
export const canvasNodeHandleStyle: CSSProperties = {
  width: 8,
  height: 8,
  /* Full pill radius, which on a square is a circle. */
  borderRadius: 9999,
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "var(--background)",
  backgroundColor: "var(--foreground)",
};

/**
 * How far above a selected node its floating colour toolbar sits, in screen
 * pixels.
 *
 * A dimension, so it belongs in this map rather than as a number in the node
 * renderer. React Flow applies this offset *after* the viewport scale and does
 * not scale the toolbar itself, so it is a constant gap at every zoom level. It
 * clears the resize handles as well as the outline: a handle is 8px and is
 * centred on the node's corner, so 4px of it sits above the top edge.
 */
export const canvasNodeToolbarOffset = 14;

/**
 * The colours a node is drawn with.
 *
 * All three are colour **strings** rather than Tailwind classes. `surface` and
 * `border` are handed to SVG `fill` and `stroke`, which cannot take a class, and
 * `labelColor` follows them so that one colour key resolves through one mechanism
 * — a background, a text colour, and a border that are read the same way and
 * cannot drift into two systems. Every value resolves to the palette in
 * `app/globals.css`, so no literal colour appears here.
 */
export interface CanvasNodeColorTokens {
  /**
   * What this colour is called in the node's colour toolbar. Display text, unlike
   * the `CanvasNodeColor` key, which is a stored identifier.
   */
  name: string;
  surface: string;
  border: string;
  /** The outline while the node is selected, so selection is not colour alone. */
  selectedBorder: string;
  /** The label sitting on `surface`, and the tint of the toolbar's active mark. */
  labelColor: string;
}

/**
 * One tinted colour, derived from an existing palette token.
 *
 * The four tinted colours differ only in which token they are mixed from, so the
 * mixing is expressed once here rather than four times below: a surface is the
 * hue dropped onto the panel colour, a border is the hue lifted out of the
 * ordinary border, the selected outline is the hue itself, and a label is
 * `--foreground` carrying just enough of the hue to pair with the surface without
 * losing contrast against it.
 *
 * The proportions follow the derived-token pattern in `ui-context.md`: a surface
 * that is a variation on an existing one is **mixed** from a palette token with
 * `color-mix(in oklab, …)` rather than given a new literal value, so these track
 * the theme instead of drifting from it.
 */
function tintedCanvasNodeColor(
  name: string,
  token: string
): CanvasNodeColorTokens {
  return {
    name,
    surface: `color-mix(in oklab, ${token} 20%, var(--card))`,
    border: `color-mix(in oklab, ${token} 55%, var(--border))`,
    selectedBorder: token,
    labelColor: `color-mix(in oklab, ${token} 14%, var(--foreground))`,
  };
}

/**
 * The canvas colour map: the predefined themes a node can be given from its
 * colour toolbar.
 *
 * `default` is the panel surface every component starts on. The other four are
 * mixed from the palette tokens the interface already has — the accent, the
 * success, the warning, and the destructive colours — rather than from four new
 * hex values, so the canvas cannot end up with a second palette.
 *
 * **They mean nothing.** A colour here is a visual grouping the person drawing
 * the diagram chooses, not a WorkHQ or Design Studio semantic: no code reads a
 * node's colour to decide anything, and `red` is not an error state any more than
 * `green` is a completed one. That a colour reuses `--destructive` is a source for
 * the hue and nothing more.
 *
 * Insertion order is the order the swatches appear in, since `canvasNodeColors`
 * below is derived from these keys.
 */
export const canvasNodeColorTokens: Record<
  CanvasNodeColor,
  CanvasNodeColorTokens
> = {
  default: {
    name: "Default",
    surface: "var(--card)",
    border: "var(--border)",
    selectedBorder: "var(--ring)",
    labelColor: "var(--foreground)",
  },
  blue: tintedCanvasNodeColor("Blue", "var(--primary)"),
  green: tintedCanvasNodeColor("Green", "var(--success)"),
  amber: tintedCanvasNodeColor("Amber", "var(--warning)"),
  red: tintedCanvasNodeColor("Red", "var(--destructive)"),
};

/** The colour every component created from the toolbar starts with. */
export const DEFAULT_CANVAS_NODE_COLOR: CanvasNodeColor = "default";

/**
 * The colour names as a runtime list, derived from the map above so the toolbar
 * cannot fall behind it: a colour added there is a swatch without any further
 * change here or in the node.
 */
export const canvasNodeColors = Object.keys(
  canvasNodeColorTokens
) as CanvasNodeColor[];

/**
 * The shape names as a runtime list, derived from the map above so it cannot fall
 * behind the type. The drag payload schema validates against it.
 */
export const canvasNodeShapes = Object.keys(
  canvasNodeShapeTokens
) as CanvasNodeShape[];
