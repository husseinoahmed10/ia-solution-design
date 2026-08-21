import type { FitViewOptions } from "@xyflow/react";

import type { CanvasNode } from "@/types/canvas";

/**
 * The shared token map for the canvas control bar and the viewport movements it
 * drives, the third sibling of `canvas-node-tokens.ts` and `canvas-edge-tokens.ts`.
 *
 * `ui-context.md` requires that a dimension the canvas is drawn or positioned with
 * lives in a shared map rather than inside a component, so the control bar reads its
 * offset and its animation duration from here and holds neither. Controls get their
 * own file rather than joining either existing map, for the same reason those two
 * are separate: nothing here is a node measurement or an edge stroke.
 *
 * There is no colour in this file. The bar is the same floating surface as the
 * component toolbar and the node colour toolbar — a bordered pill on `--card` — which
 * is expressed in Tailwind classes against the palette, exactly as those two are.
 */

/**
 * How long a viewport movement takes, in milliseconds.
 *
 * Short enough to feel immediate and long enough to show which way the canvas
 * moved: a zoom that jumps loses the reader's place on a large diagram, because
 * nothing connects the components that were in view to the ones that are now.
 *
 * Every viewport call the control bar and the keyboard shortcuts make passes this,
 * so zooming with a button and zooming with a key are the same movement. React Flow
 * applies a transition only when a duration is given, so its own default is no
 * animation at all.
 */
export const CANVAS_VIEWPORT_ANIMATION_DURATION = 200;

/**
 * How the canvas is fitted to the components on it.
 *
 * `maxZoom` is a **floor under the zoom level fitting produces**, and it is
 * load-bearing rather than cosmetic: fitting a single component fills the viewport
 * with it, so a canvas holding one node would jump to an enormous zoom. It is
 * shared between `<ReactFlow fitView>`, which fits the canvas when the room is
 * first joined, and the control bar's fit-view button, so both come to rest at the
 * same place.
 *
 * The object identity is fixed at module scope: React Flow keeps the prop in its
 * store, so a fresh literal on every render would be a new value each time.
 *
 * No `duration` is set here. The initial fit has nothing to animate from — the
 * canvas has only just appeared — so the duration is added by the button that
 * animates, not carried by the options both share.
 */
export const canvasFitViewOptions: FitViewOptions<CanvasNode> = {
  maxZoom: 1,
};

/**
 * How far the control bar sits above the bottom edge of the canvas, on top of the
 * 15px margin React Flow's own `base.css` gives every `Panel`.
 *
 * This is what keeps the bar clear of the component toolbar. The toolbar is a
 * bottom-centre pill that grows to nearly the full width of the canvas, so at any
 * window narrow enough for it to reach its maximum the two would otherwise overlap
 * in the bottom-left corner — a horizontal gap cannot be relied on. The value clears
 * the toolbar's own height and leaves a visible gap above it.
 *
 * It is applied as an inline `bottom`, not a Tailwind class. `base.css` pins a
 * bottom panel with `bottom: 0` at the same specificity a utility class has, so
 * which one won would depend on the order the two stylesheets end up in; an inline
 * value cannot lose.
 */
export const CANVAS_CONTROL_BAR_BOTTOM_OFFSET = "3.5rem";
