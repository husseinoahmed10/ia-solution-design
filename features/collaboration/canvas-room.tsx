"use client";

import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
  useErrorListener,
} from "@liveblocks/react/suspense";
import { type ReactNode, useState } from "react";

import { ArchitectureCanvas } from "@/features/collaboration/architecture-canvas";
import {
  CanvasConnectionError,
  CanvasLoading,
} from "@/features/collaboration/canvas-connection-states";

/**
 * Puts the open project's workspace into its Liveblocks room and renders the
 * canvas inside it.
 *
 * This is the boundary between the server-rendered workspace and the
 * collaborative canvas: the page stays a Server Component and resolves access,
 * and this component — the first client component on the path — owns the room.
 *
 * The room ID **is** the project ID, which is also the `/editor/[projectId]`
 * segment and the `Project.id` row. There is one identifier for a project across
 * the database, the URL, and Liveblocks, so no mapping or rename can put two
 * users in different rooms for the same project.
 *
 * The ID still arrives from the browser, so it is not trusted on the strength of
 * this component. `POST /api/liveblocks-auth` resolves access again server-side
 * before minting a token, and refuses a project the user may not open, so
 * mounting this with any project ID cannot get anybody into a room.
 */
export function CanvasRoom({ projectId }: CanvasRoomProps) {
  return (
    /*
     * `authEndpoint` rather than `publicApiKey`: a room is only joinable by an
     * owner or a collaborator, so the token has to be minted by a server that can
     * check that. Nothing about the Liveblocks account reaches the browser.
     */
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider
        id={projectId}
        /*
         * `cursor: null` is the honest starting state — the pointer is not over the
         * canvas until it moves there, and `{ x: 0, y: 0 }` would be indistinguishable
         * from a user sitting in the top-left corner. `isThinking` is required by the
         * `Presence` contract, and nobody is generating anything at the moment a room
         * is joined.
         *
         * No `initialStorage`: `useLiveblocksFlow` initialises the `flow` tree itself,
         * and a second initialiser here would be a competing definition of the same
         * document.
         */
        initialPresence={{ cursor: null, isThinking: false }}
      >
        <CanvasConnectionBoundary>
          {/*
           * The canvas suspends until Storage has loaded. On the server the fallback
           * is what renders, which is correct — a room is joined from the browser.
           */}
          <ClientSideSuspense fallback={<CanvasLoading />}>
            <ArchitectureCanvas />
          </ClientSideSuspense>
        </CanvasConnectionBoundary>
      </RoomProvider>
    </LiveblocksProvider>
  );
}

interface CanvasRoomProps {
  /** The open project's ID, which is also its Liveblocks room ID. */
  projectId: string;
}

/**
 * Replaces its children with an error screen once the room has permanently failed
 * to connect.
 *
 * A React error boundary would not catch this. The failure happens inside the
 * Liveblocks client's own connection state machine, not while rendering: the
 * canvas is suspended waiting for Storage that will never arrive, so nothing
 * throws and the loading state would otherwise stay on screen forever with the
 * reason only in the console. `useErrorListener` is the event that reports it, and
 * it must be called inside `LiveblocksProvider` because it subscribes to the
 * client.
 *
 * Only a `ROOM_CONNECTION_ERROR` is treated as fatal, and only for this room.
 * Liveblocks retries a transient problem on its own and emits nothing while doing
 * so, so an error arriving here means it has stopped retrying — a refused token, a
 * project the session may no longer open, or a server with no
 * `LIVEBLOCKS_SECRET_KEY`. Errors of other kinds are left alone rather than
 * swallowed: they belong to features this unit does not have, and taking the
 * canvas down for one would be wrong.
 *
 * There is no retry button. The client has already exhausted its retries, and the
 * causes are resolved by the server or by regaining access — neither of which a
 * second attempt from this component would change — so the error screen asks for a
 * reload instead of offering an action that cannot help.
 */
function CanvasConnectionBoundary({ children }: CanvasConnectionBoundaryProps) {
  const [hasConnectionError, setHasConnectionError] = useState(false);

  useErrorListener((error) => {
    if (error.context.type === "ROOM_CONNECTION_ERROR") {
      setHasConnectionError(true);
    }
  });

  if (hasConnectionError) {
    return <CanvasConnectionError />;
  }

  return children;
}

interface CanvasConnectionBoundaryProps {
  children: ReactNode;
}
