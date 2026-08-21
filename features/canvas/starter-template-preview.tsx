import { CanvasNodeShapePath } from "@/features/canvas/canvas-node-shape";
import {
  CANVAS_EDGE_STROKE,
  canvasEdgeOpacity,
} from "@/features/canvas/canvas-edge-tokens";
import { canvasNodeColorTokens } from "@/features/canvas/canvas-node-tokens";
import {
  resolveCanvasTemplateNodes,
  type CanvasTemplate,
  type CanvasTemplateEdge,
  type ResolvedCanvasTemplateNode,
} from "@/features/canvas/starter-templates";

/**
 * A starter template's diagram, drawn small enough to sit on its card.
 *
 * **One `<svg>`, and nothing else.** There is no React Flow instance here — no
 * `ReactFlowProvider`, no store, no viewport, no handles — and no Liveblocks: a
 * preview is local, read-only UI that renders from a template definition, so a
 * modal listing three templates does not mount three canvases behind a dialog.
 *
 * It is nevertheless an honest picture of what will land, because it is drawn from
 * the same two sources the import is: `resolveCanvasTemplateNodes` for each
 * component's shape, size, and colour, and `CanvasNodeShapePath` for the geometry
 * of that shape. Nothing about how a component looks is re-decided here.
 *
 * What it deliberately leaves out is detail that does not survive the scale.
 * Labels are not drawn — at this size the text of five components would be
 * illegible and would only crowd the shapes — and connections are straight lines
 * between centres rather than the canvas's right-angled routing, which needs
 * measured handle positions to compute. The card's name and description carry the
 * meaning; the diagram carries the arrangement.
 */

/**
 * The preview's own coordinate space, in the units its `viewBox` is expressed in.
 *
 * A **fixed** box, so every card's diagram is scaled into the same area and the
 * templates read as a set rather than as three differently sized pictures. The
 * numbers are the space, not a pixel size: the `<svg>` fills its container and
 * `preserveAspectRatio` letterboxes it, so a card in a narrower column shows the
 * same diagram smaller rather than a distorted one.
 *
 * The ratio is wide because these architectures are: a flow of five components
 * reading left to right is a strip, and a taller box would be mostly empty.
 */
const PREVIEW_WIDTH = 320;
const PREVIEW_HEIGHT = 132;

/**
 * The margin kept clear inside that box.
 *
 * It is what stops the outermost shapes' strokes being clipped by the `viewBox`
 * edge — a stroke straddles its path, as the node outline's own inset comment
 * explains — and it keeps the diagram off the edge of the card's preview panel.
 */
const PREVIEW_PADDING = 12;

/**
 * How thickly a preview shape and a preview connection are stroked.
 *
 * A **constant**, not the canvas's own stroke weight scaled down: the scale factor
 * below is applied to coordinates rather than through an SVG transform, so a stroke
 * is never squashed with the geometry and one hairline reads the same on every
 * template no matter how much each was reduced. It is thinner than the canvas's
 * resting weight because the shapes are much smaller here.
 */
const PREVIEW_STROKE_WIDTH = 1;

interface StarterTemplatePreviewProps {
  template: CanvasTemplate;
}

export function StarterTemplatePreview({
  template,
}: StarterTemplatePreviewProps) {
  const layout = layOutTemplatePreview(
    resolveCanvasTemplateNodes(template),
    template.edges
  );

  return (
    <svg
      className="h-full w-full"
      viewBox={`0 0 ${PREVIEW_WIDTH} ${PREVIEW_HEIGHT}`}
      /*
       * `meet` rather than `none`: the diagram has already been fitted into the box
       * by the layout below, so this only decides what happens when the container's
       * own aspect ratio differs. Letterboxing keeps the shapes in proportion, where
       * `none` would stretch a circle into an oval in a narrow column.
       */
      preserveAspectRatio="xMidYMid meet"
      /*
       * Decoration. The template's name and description are the accessible content
       * of the card, and an unlabelled arrangement of shapes adds nothing a screen
       * reader can use — while a generated description of it would be text nobody
       * wrote. The import button is a real control and is named properly.
       */
      aria-hidden
      focusable="false"
    >
      {/*
       * Connections first, so a line ends *behind* the shape it points at rather
       * than crossing over it. The canvas has the same order for the same reason:
       * React Flow renders the edge layer below the node layer.
       *
       * Straight centre-to-centre lines, and no arrowhead. A marker would need its
       * own `<defs>` here — React Flow generates the canvas's from its store, which
       * this preview has none of — and at this size a 2px arrow would be a smudge
       * against the shape it meets. Which way the flow runs is legible from the
       * left-to-right arrangement.
       */}
      {layout.edges.map((edge) => (
        <line
          key={edge.key}
          x1={edge.x1}
          y1={edge.y1}
          x2={edge.x2}
          y2={edge.y2}
          stroke={CANVAS_EDGE_STROKE}
          strokeWidth={PREVIEW_STROKE_WIDTH}
          /*
           * The canvas's resting opacity, from the shared edge token map, so the
           * lines sit behind the components here exactly as they do there.
           */
          opacity={canvasEdgeOpacity.rest}
          strokeLinecap="round"
        />
      ))}

      {layout.nodes.map((node) => (
        <CanvasNodeShapePath
          key={node.key}
          shape={node.shape}
          x={node.x}
          y={node.y}
          width={node.width}
          height={node.height}
          /*
           * The node colour map's own surface and border. The **resting** border,
           * never the selected one: nothing in a preview is selected, and there is
           * nothing here to select.
           */
          fill={node.surface}
          stroke={node.border}
          strokeWidth={PREVIEW_STROKE_WIDTH}
        />
      ))}
    </svg>
  );
}

interface PreviewShape {
  key: string;
  shape: ResolvedCanvasTemplateNode["shape"];
  x: number;
  y: number;
  width: number;
  height: number;
  surface: string;
  border: string;
}

interface PreviewLine {
  key: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface PreviewLayout {
  nodes: PreviewShape[];
  edges: PreviewLine[];
}

/**
 * Fits a template's components into the fixed preview box.
 *
 * The bounds are computed from the template's **own** node positions and sizes
 * rather than being authored per template, so a template whose layout is edited, or
 * one added later, is framed correctly with no preview change: the union of every
 * component's box is measured, scaled to fit the padded box, and centred in it.
 *
 * The scale is applied to the **coordinates** as they are computed, not as an SVG
 * `transform` around the shapes. That is what lets the stroke width above be a
 * constant: a `transform="scale(0.2)"` would scale the stroke with the geometry and
 * leave a hairline invisible on a wide template and heavy on a narrow one.
 *
 * It never scales *up*. A template smaller than the preview box is drawn at its own
 * size and centred, because enlarging a two-component diagram to fill the panel
 * would make it look like a different, bigger architecture than the five-component
 * one beside it.
 */
function layOutTemplatePreview(
  nodes: readonly ResolvedCanvasTemplateNode[],
  edges: readonly CanvasTemplateEdge[]
): PreviewLayout {
  if (nodes.length === 0) {
    return { nodes: [], edges: [] };
  }

  const minX = Math.min(...nodes.map((node) => node.x));
  const minY = Math.min(...nodes.map((node) => node.y));
  const maxX = Math.max(...nodes.map((node) => node.x + node.width));
  const maxY = Math.max(...nodes.map((node) => node.y + node.height));

  /*
   * A floor of 1 rather than the measured extent, so a single component — whose
   * bounds are its own box and never zero, but which a later template could in
   * principle make degenerate — cannot divide by zero.
   */
  const boundsWidth = Math.max(maxX - minX, 1);
  const boundsHeight = Math.max(maxY - minY, 1);

  const availableWidth = PREVIEW_WIDTH - PREVIEW_PADDING * 2;
  const availableHeight = PREVIEW_HEIGHT - PREVIEW_PADDING * 2;

  const scale = Math.min(
    availableWidth / boundsWidth,
    availableHeight / boundsHeight,
    1
  );

  /* Centre whatever the fitted diagram did not use of the padded box. */
  const offsetX = (PREVIEW_WIDTH - boundsWidth * scale) / 2;
  const offsetY = (PREVIEW_HEIGHT - boundsHeight * scale) / 2;

  const toPreviewX = (x: number) => offsetX + (x - minX) * scale;
  const toPreviewY = (y: number) => offsetY + (y - minY) * scale;

  /*
   * Centres, keyed by template-local ID, so a connection can find both of its ends.
   * Built from the same fitted coordinates the shapes are drawn at, so a line meets
   * the middle of a shape rather than a point computed from the unscaled positions.
   */
  const centres = new Map<string, { x: number; y: number }>(
    nodes.map((node) => [
      node.templateNodeId,
      {
        x: toPreviewX(node.x + node.width / 2),
        y: toPreviewY(node.y + node.height / 2),
      },
    ])
  );

  return {
    nodes: nodes.map((node) => {
      const { surface, border } = canvasNodeColorTokens[node.color];

      return {
        key: node.templateNodeId,
        shape: node.shape,
        x: toPreviewX(node.x),
        y: toPreviewY(node.y),
        width: node.width * scale,
        height: node.height * scale,
        surface,
        border,
      };
    }),
    edges: edges.flatMap((edge) => {
      const source = centres.get(edge.source);
      const target = centres.get(edge.target);

      /*
       * An end with no component, which happens only when its component type has
       * left the catalogue and the resolver skipped it. The preview drops the line
       * with it, exactly as the import drops the edge — so a card keeps showing what
       * importing it would actually produce.
       */
      if (!source || !target) {
        return [];
      }

      return [
        {
          key: `${edge.source}-${edge.sourceHandle}-${edge.target}-${edge.targetHandle}`,
          x1: source.x,
          y1: source.y,
          x2: target.x,
          y2: target.y,
        },
      ];
    }),
  };
}
