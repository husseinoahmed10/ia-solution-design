import type { LiveblocksFlow } from "@liveblocks/react-flow";

import type { CanvasEdge, CanvasNode } from "@/types/canvas";

/**
 * The types Liveblocks uses across this application.
 *
 * This is a global declaration rather than a module, which is how Liveblocks
 * types itself: every hook and every server call reads `Presence` and `UserMeta`
 * from here, so there is one definition of what a collaborator broadcasts and
 * what is known about them. See
 * https://liveblocks.io/docs/api-reference/liveblocks-react#Typing-your-data
 *
 * A room ID is always a `Project.id` — the same value as the
 * `/editor/[projectId]` segment — so nothing in these types carries a project
 * name or any second identifier.
 */
declare global {
  interface Liveblocks {
    /**
     * What each user broadcasts while in a project workspace, for `useMyPresence`
     * and `useOthers`.
     *
     * `cursor` is `null` when the pointer is not over the canvas, which is a
     * normal state rather than a missing value — a cursor at `{ x: 0, y: 0 }`
     * would otherwise be indistinguishable from a user who has moved away.
     *
     * `isThinking` marks a collaborator the AI design assistant is working on
     * behalf of, so the canvas can show that generation is in progress for
     * somebody. No presence is written yet: this unit establishes the contract,
     * and the cursors and the AI behaviour that use it come later.
     */
    Presence: {
      cursor: { x: number; y: number } | null;
      isThinking: boolean;
    };

    /**
     * The conflict-free room tree, for `useStorage` and `useMutation`.
     *
     * One key, `flow`, holding the architecture canvas: a `LiveObject` of two
     * `LiveMap`s, one of nodes and one of edges, keyed by React Flow ID. This is
     * the shape `useLiveblocksFlow` reads and writes under its default storage
     * key, so it is described here from the canvas' own `CanvasNode` and
     * `CanvasEdge` types rather than hand-modelled — the collaborative document
     * and what React Flow renders cannot then drift apart.
     *
     * The key is **optional** for two reasons. A room that has never been opened
     * has no `flow` yet, and `useLiveblocksFlow` creates it on first load rather
     * than expecting it to exist. And a required key would make `initialStorage` a
     * required `RoomProvider` prop, which would put a second, competing
     * initialisation of the same tree in the room wrapper.
     *
     * Nothing else writes storage: canvas state lives here alone, with no separate
     * database or blob copy.
     */
    Storage: {
      flow?: LiveblocksFlow<CanvasNode, CanvasEdge>;
    };

    /**
     * Who a connected user is. `id` is the **Clerk user ID**, which is what
     * `POST /api/liveblocks-auth` opens the session with, so a presence in a room
     * can always be traced back to a Clerk user.
     *
     * `info` is set server-side from the authenticated session and is therefore
     * not client-supplied. `name` and `color` always resolve — the name through a
     * fallback chain over the user's own Clerk data, and the colour
     * deterministically from the user ID.
     *
     * `avatar` is **optional rather than nullable**: Liveblocks constrains its own
     * `name` and `avatar` fields to `string | undefined`, so a `null` would be
     * rejected by `UserMeta`'s own constraint. A Clerk profile is not guaranteed to
     * carry an image, so the key is simply omitted when there is none and the
     * client renders an initial.
     */
    UserMeta: {
      id: string;
      info: {
        name: string;
        avatar?: string;
        color: string;
      };
    };
  }
}

/**
 * The `info` attached to a Liveblocks session, as a named type.
 *
 * A module that imports the `Liveblocks` **class** from `@liveblocks/node` — the
 * server adapter does — shadows the global interface above and cannot write
 * `Liveblocks["UserMeta"]["info"]`. Exporting the alias from here keeps one
 * definition rather than a second copy that could drift from it.
 */
export type ProjectUserInfo = Liveblocks["UserMeta"]["info"];
