"use client";

import { Cursors, type CursorsCursorProps } from "@liveblocks/react-flow";
import { shallow, useOther } from "@liveblocks/react/suspense";

/*
 * One rule, and all of it structural: it stretches the cursor layer over the flow,
 * clips it, and makes it transparent to the pointer — so a cursor near the edge cannot
 * paint over the navbar, and nobody else's pointer can intercept a click on a node.
 * Its `z-index: 5` is React Flow's own panel layer, which is why DOM order decides
 * whether the cursors sit under this canvas' overlays; the flow mounts them first.
 *
 * It is imported here, colocated with the only component that needs it, in the same
 * way the canvas imports React Flow's `base.css`.
 *
 * `@liveblocks/react-ui/styles.css` is deliberately **not** imported: the cursor
 * below is this application's own, so none of Liveblocks' component styling is used.
 */
import "@liveblocks/react-flow/styles.css";

/**
 * Every other person's pointer, on the canvas, in the position they are pointing at.
 *
 * The broadcast and the coordinate conversion are `@liveblocks/react-flow`'s own
 * `Cursors`, and using it rather than writing a second version of both is the point.
 * Read from its shipped source, it does exactly what this unit specifies:
 *
 * - it writes the pointer to presence under the **`cursor`** key — the key this
 *   application's `Presence` already declares — as a partial update, so `isThinking`
 *   is untouched and the presence contract in `liveblocks.config.ts` is unchanged;
 * - the value is **React Flow coordinates**, through `screenToFlowPosition` on the
 *   same flow instance the drop handler uses, so it is the point on the *diagram*
 *   rather than a point on this user's screen;
 * - it sets `cursor` to `null` when the pointer leaves the flow, when the window
 *   loses focus, and when the canvas unmounts, so nobody is left pointing at
 *   something they walked away from;
 * - it renders **only others** — the list comes from the room's other connection IDs —
 *   so the current user's own cursor is never drawn under their real one;
 * - it converts each collaborator's stored point back with this viewer's own pan and
 *   zoom, and subscribes to that transform, so two people looking at different parts
 *   of the diagram at different zoom levels both see the pointer over the same
 *   component;
 * - and it skips broadcasting while the pane is being dragged, so panning does not
 *   send a stream of positions the user is not pointing at.
 *
 * A cursor is presence and nothing else: it is not written to Storage, so it is not
 * part of the document, and nothing about it reaches PostgreSQL. Zoom, pan, hover, and
 * selection stay this client's own — the only thing this canvas shares beyond the
 * document itself is where each person is pointing.
 *
 * What *is* ours is the appearance, passed in as the `Cursor` component below.
 */
export function CollaboratorCursors() {
  return <Cursors components={{ Cursor: CollaboratorCursor }} />;
}

/**
 * One collaborator's pointer: an arrow in their colour with their name beside it.
 *
 * `Cursors` positions this component and shows or hides it; this decides only what it
 * looks like. The identity is read from that connection's session `info` — the name
 * and the colour attached server-side by `POST /api/liveblocks-auth` — subscribed per
 * connection so one person moving does not re-render another's cursor.
 *
 * **The name is always shown.** The palette holds eight colours, so two people in a
 * busy room can share one, and the colour alone would then be ambiguous.
 */
function CollaboratorCursor({ connectionId }: CursorsCursorProps) {
  const { name, color } = useOther(
    connectionId,
    (other) => other.info,
    shallow
  );

  return (
    <div className="flex items-start">
      {/*
       * A plain arrow, filled with the collaborator's colour and outlined in the
       * canvas' own background colour. The outline is what keeps it visible over a
       * coloured node: `--warning`-derived surfaces and a `#FBBF24` cursor are close
       * enough that the shape would otherwise disappear into one.
       *
       * The fill is an inline value because it arrived over the wire — a cursor colour
       * is data, per `ui-context.md` — while the outline is a `var(--token)`, since it
       * belongs to this client's palette rather than to the collaborator.
       */}
      <svg
        aria-hidden
        viewBox="0 0 20 20"
        className="size-5 shrink-0 drop-shadow-sm"
      >
        <path
          d="M4 2.5 L4 16.2 L7.9 12.4 L10.4 18.3 L12.9 17.2 L10.4 11.4 L15.6 11 Z"
          fill={color}
          stroke="var(--background)"
          strokeWidth={1.2}
          strokeLinejoin="round"
        />
      </svg>

      {/*
       * The name badge, offset down and back so it hangs off the arrow's tail rather
       * than covering the point being indicated.
       *
       * The label colour is `--background`, the darkest token, rather than white: the
       * eight cursor colours are all light, saturated hues, so dark type on them is
       * what stays legible.
       */}
      <span
        className="mt-3.5 -ml-1 rounded-full px-1.5 py-0.5 text-xs leading-tight font-medium whitespace-nowrap text-background shadow-sm"
        style={{ backgroundColor: color }}
      >
        {name}
      </span>
    </div>
  );
}
