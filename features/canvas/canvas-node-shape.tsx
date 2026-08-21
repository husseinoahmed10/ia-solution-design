import {
  canvasNodeColorTokens,
  canvasNodeStrokeWidths,
} from "@/features/canvas/canvas-node-tokens";
import type { CanvasNodeColor, CanvasNodeShape } from "@/types/canvas";

/**
 * The outline a canvas component is drawn with.
 *
 * One SVG, sized to the node, sitting behind the label. Drawing the shapes in SVG
 * rather than with CSS is what keeps them one mechanism: a hexagon, a cylinder, and
 * a diamond have no CSS border, and `clip-path` would cut the outline off instead
 * of stroking it, so the shapes would have had to be drawn two different ways with
 * only some of them able to show a border.
 *
 * The fill and the stroke are `var(--token)` references handed to SVG attributes,
 * which cannot take a Tailwind class. They come from the shared map in
 * `canvas-node-tokens.ts`, so this component holds no colour of its own — and
 * neither of the two stroke weights either.
 *
 * Selection is shown **on the outline**, in both the colour and the weight: the
 * stroke follows whatever shape is drawn and scales with the node, where a CSS
 * ring on the wrapper would be a rectangle sitting around a hexagon or a circle
 * instead of on it. Two channels rather than one, because selection must not be
 * colour alone (`ui-context.md`).
 *
 * This is the basic outline only. Detailed WorkHQ and Design Studio stage rendering
 * is deliberately absent, and nothing here depicts a capability of either product
 * (invariant 7).
 */

interface CanvasNodeShapeProps {
  shape: CanvasNodeShape;
  color: CanvasNodeColor;
  width: number;
  height: number;
  selected: boolean;
}

export function CanvasNodeShapeOutline({
  shape,
  color,
  width,
  height,
  selected,
}: CanvasNodeShapeProps) {
  const { surface, border, selectedBorder } = canvasNodeColorTokens[color];

  const strokeWidth = selected
    ? canvasNodeStrokeWidths.selected
    : canvasNodeStrokeWidths.rest;

  /*
   * The stroke straddles the path, so a path on the boundary would be clipped in
   * half by the viewBox. Every shape is therefore laid out inside a box inset by
   * half the stroke — the *current* stroke, so the heavier selected outline is not
   * clipped either.
   */
  const inset = strokeWidth / 2;
  const innerWidth = Math.max(width - strokeWidth, 0);
  const innerHeight = Math.max(height - strokeWidth, 0);

  return (
    <svg
      /*
       * `absolute inset-0` so the label can sit above it in the same box, and
       * `pointer-events-none` so the drag, the selection click, and the connection
       * handles are all still the node's — the outline is decoration.
       */
      className="pointer-events-none absolute inset-0"
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      /*
       * The viewBox matches the node's own size in canvas units, so nothing is
       * scaled and the stroke keeps the same weight on every shape.
       */
      preserveAspectRatio="none"
      aria-hidden
      focusable="false"
    >
      <CanvasNodeShapePath
        shape={shape}
        x={inset}
        y={inset}
        width={innerWidth}
        height={innerHeight}
        fill={surface}
        stroke={selected ? selectedBorder : border}
        strokeWidth={strokeWidth}
      />
    </svg>
  );
}

interface CanvasNodeShapePathProps {
  shape: CanvasNodeShape;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
}

/**
 * One shape's geometry, as SVG elements for whatever `<svg>` renders it.
 *
 * Exported, because a second read-only view now draws the same shapes: a starter
 * template's diagram preview lays every component out inside **one** small `<svg>`
 * of its own, so it cannot compose `CanvasNodeShapeOutline` — that component is an
 * `<svg>` filling a node's box. Sharing the geometry rather than redrawing it is
 * what keeps a preview an honest picture of the architecture that will land: a
 * hexagon's points and a cylinder's rim are computed here, once.
 *
 * It takes its box and its colours as plain values and holds no state, so a caller
 * may place it in canvas units — as the node outline does — or in the scaled-down
 * units of a preview.
 */
export function CanvasNodeShapePath({
  shape,
  x,
  y,
  width,
  height,
  fill,
  stroke,
  strokeWidth,
}: CanvasNodeShapePathProps) {
  const shared = {
    fill,
    stroke,
    strokeWidth,
  };

  switch (shape) {
    case "rectangle":
      return <rect x={x} y={y} width={width} height={height} rx={10} {...shared} />;

    /*
     * A pill is a rectangle whose corner radius is its half-height, so the two ends
     * are semicircles. Deriving it rather than fixing a radius keeps it a pill at
     * whatever height the node ends up.
     */
    case "pill":
      return (
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          rx={height / 2}
          {...shared}
        />
      );

    /*
     * An ellipse rather than a circle element: the default size for this shape is
     * square, so it draws a circle, but a resized node then stays a smooth oval
     * instead of a circle with empty space beside it.
     */
    case "circle":
      return (
        <ellipse
          cx={x + width / 2}
          cy={y + height / 2}
          rx={width / 2}
          ry={height / 2}
          {...shared}
        />
      );

    case "diamond":
      return (
        <polygon
          points={[
            `${x + width / 2},${y}`,
            `${x + width},${y + height / 2}`,
            `${x + width / 2},${y + height}`,
            `${x},${y + height / 2}`,
          ].join(" ")}
          {...shared}
        />
      );

    /*
     * The points are capped in absolute units as well as taken as a fraction of the
     * width, so a wide component does not turn into an arrowhead.
     */
    case "hexagon": {
      const point = Math.min(width * 0.16, 28);

      return (
        <polygon
          points={[
            `${x + point},${y}`,
            `${x + width - point},${y}`,
            `${x + width},${y + height / 2}`,
            `${x + width - point},${y + height}`,
            `${x + point},${y + height}`,
            `${x},${y + height / 2}`,
          ].join(" ")}
          {...shared}
        />
      );
    }

    /*
     * A cylinder is two paths: the body, whose top and bottom edges are elliptical
     * arcs, and the rim — the front half of the top ellipse — drawn over it as a
     * stroke with no fill, which is what reads as a lid rather than a bulge.
     */
    case "cylinder": {
      const rimRadiusY = Math.min(height * 0.16, 16);
      const radiusX = width / 2;
      const left = x;
      const right = x + width;
      const top = y + rimRadiusY;
      const bottom = y + height - rimRadiusY;

      return (
        <>
          <path
            d={[
              `M ${left},${top}`,
              `A ${radiusX},${rimRadiusY} 0 0 1 ${right},${top}`,
              `L ${right},${bottom}`,
              `A ${radiusX},${rimRadiusY} 0 0 1 ${left},${bottom}`,
              "Z",
            ].join(" ")}
            {...shared}
          />
          <path
            d={`M ${left},${top} A ${radiusX},${rimRadiusY} 0 0 0 ${right},${top}`}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        </>
      );
    }
  }
}
