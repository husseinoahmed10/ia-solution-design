"use client";

import { UserButton } from "@clerk/nextjs";
import { ClientSideSuspense } from "@liveblocks/react/suspense";

import { CollaboratorAvatarStack } from "@/features/collaboration/collaborator-avatar-stack";
import { PRESENCE_AVATAR_SIZE } from "@/features/collaboration/presence-tokens";

/**
 * Who is in this project workspace, floating in the **top-right corner of the
 * canvas**.
 *
 * It is a group of equals read left to right: the other people in the room, a subtle
 * rule, and then the current user. The collaborators come from Liveblocks presence
 * and are display-only; the current user is Clerk's own `UserButton`, with its
 * profile and sign-out flows exactly as they were in the navbar — this is where that
 * one button now lives while a project canvas is open, so nobody is shown twice.
 *
 * **It belongs to the canvas, not to the navbar.** The bar across the top is chrome
 * for every editor screen, including the editor home where there is no room and
 * therefore nobody to show; presence is a property of an open project canvas, so it
 * is mounted with the room and disappears with it.
 *
 * The group is an absolute overlay rather than a React Flow `Panel`, unlike the
 * component toolbar and the control bar. That is deliberate: those two act on the
 * flow and cannot exist without it, while this one is mounted **beside** the flow, so
 * the account menu is still reachable while the room is connecting and if it
 * permanently fails. Being outside `<ReactFlow>` also means it needs no
 * `nodrag nopan nowheel` — the wheel and drag handlers it would have to opt out of
 * are bound to the flow's own element, which is not this element's ancestor.
 */
export function CanvasParticipants() {
  return (
    <div
      role="group"
      aria-label="Participants"
      /*
       * The same floating surface as the canvas' other overlays — a bordered pill on
       * `--card` with a shadow and a backdrop blur — so every overlay on the canvas
       * reads as the same kind of thing. `z-20` puts it over React Flow's own panels,
       * which sit at `z-index: 5`, and under the two `z-40` side panels, which are
       * chrome above the canvas rather than part of it.
       */
      className="absolute top-4 right-4 z-20 flex items-center gap-2 rounded-full border border-border bg-card/95 p-1.5 shadow-lg backdrop-blur"
    >
      {/*
       * The stack reads the room's others, so it suspends until presence has loaded.
       * Its fallback is deliberately `null` rather than a placeholder: a skeleton of
       * an avatar would imply somebody is there before the room can say whether
       * anybody is, and it resolves in the same moment the canvas beside it does.
       *
       * A boundary of its own, not the room wrapper's, so the current user's button
       * renders immediately either way — including on the loading and error states,
       * where the canvas itself has not rendered at all.
       */}
      <ClientSideSuspense fallback={null}>
        <CollaboratorAvatarStack />
      </ClientSideSuspense>

      <UserButton
        /*
         * Sized to match the collaborator avatars beside it, from the one shared
         * value, as an inline style — the token module records why a class cannot do
         * this. Nothing else about Clerk's button is changed: the palette, the type,
         * and the menu still come from `lib/clerk-appearance.ts` and from Clerk.
         */
        appearance={{
          elements: {
            userButtonAvatarBox: {
              width: PRESENCE_AVATAR_SIZE,
              height: PRESENCE_AVATAR_SIZE,
            },
          },
        }}
      />
    </div>
  );
}
