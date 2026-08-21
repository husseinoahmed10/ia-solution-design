"use client";

import { shallow, useOther, useOthers } from "@liveblocks/react/suspense";

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  MAX_VISIBLE_COLLABORATOR_AVATARS,
  PRESENCE_AVATAR_SIZE,
} from "@/features/collaboration/presence-tokens";

/**
 * The other people in this project room, as an overlapping stack of avatars.
 *
 * **`useOthers`, so the current user is never in it.** Liveblocks reports the room's
 * others separately from `self`, so the person looking at the screen cannot appear
 * twice — once here and once as the `UserButton` beside it — and no filtering by ID
 * is needed to keep them out.
 *
 * The selector returns **connection IDs only**, compared with `shallow`. Presence
 * updates as often as a cursor moves, which is many times a second, and a plain
 * `useOthers()` would re-render this stack on every one of them; a list of IDs
 * changes only when somebody joins or leaves. Each avatar then subscribes to its own
 * collaborator, so nobody's arrival re-renders the rest.
 *
 * Renders **nothing at all** when the room holds one person, so an empty divider or
 * a stray label never appears next to the current user's own button.
 */
export function CollaboratorAvatarStack() {
  const connectionIds = useOthers(
    (others) => others.map((other) => other.connectionId),
    shallow
  );

  if (connectionIds.length === 0) {
    return null;
  }

  const visibleConnectionIds = connectionIds.slice(
    0,
    MAX_VISIBLE_COLLABORATOR_AVATARS
  );
  const hiddenCount = connectionIds.length - visibleConnectionIds.length;

  return (
    <>
      <AvatarGroup
        role="group"
        aria-label={
          connectionIds.length === 1
            ? "1 other person in this project"
            : `${connectionIds.length} other people in this project`
        }
      >
        {visibleConnectionIds.map((connectionId) => (
          <CollaboratorAvatar key={connectionId} connectionId={connectionId} />
        ))}

        {/*
         * Everyone past the fifth, as a count rather than as more faces. The chip is
         * the primitive's own muted circle — it names no individual, so it takes no
         * collaborator colour.
         */}
        {hiddenCount > 0 ? (
          <AvatarGroupCount
            className="text-xs"
            style={{ width: PRESENCE_AVATAR_SIZE, height: PRESENCE_AVATAR_SIZE }}
            /*
             * A hover hint only. The chip's own `+N` is already text, and the group's
             * label above it announces the full count, so it needs no second
             * accessible name of its own.
             */
            title={`${hiddenCount} more`}
          >
            +{hiddenCount}
          </AvatarGroupCount>
        ) : null}
      </AvatarGroup>

      {/*
       * The rule between the collaborators and the current user, rendered here
       * rather than by the group above, because this is the component that knows
       * whether there is anything to divide: with nobody else in the room it returns
       * early and the divider goes with it.
       *
       * `self-stretch` is load-bearing — the group is `items-center`, where a `w-px`
       * element with no content has no height at all — and it is the same inset rule
       * the canvas control bar separates its two groups with.
       */}
      <div aria-hidden className="my-1 w-px shrink-0 self-stretch bg-border" />
    </>
  );
}

/**
 * One collaborator.
 *
 * Subscribed to that connection alone, so a cursor moving somewhere else in the room
 * does not re-render this avatar, and the identity it draws is the **session's own
 * `info`** — the name, the image, and the colour attached to the token server-side in
 * `POST /api/liveblocks-auth`. A client cannot name or colour itself, so nothing here
 * is treated as untrusted input.
 *
 * `useUser` is deliberately not used: it resolves a user through a `resolveUsers`
 * callback on `LiveblocksProvider`, which this application does not have — identity
 * travels with the session instead.
 *
 * The avatar is **display-only**. It is not a button, has no menu, and does nothing
 * on click: this unit shows who is here, and acting on a person is the share
 * dialog's job.
 */
function CollaboratorAvatar({ connectionId }: { connectionId: number }) {
  const { name, avatar, color } = useOther(
    connectionId,
    (other) => other.info,
    shallow
  );

  return (
    <Avatar
      /*
       * `role="img"` with the person's name, because this is a picture of somebody
       * rather than a control: a bare `div` carrying `aria-label` is not reliably
       * announced, and the name is the only thing a screen reader can convey about a
       * face. `title` gives the same name as a hover hint, which is how an avatar is
       * identified with a pointer.
       */
      role="img"
      aria-label={name}
      title={name}
      style={{
        width: PRESENCE_AVATAR_SIZE,
        height: PRESENCE_AVATAR_SIZE,
        /*
         * The ring is this collaborator's own colour, so the same hue identifies them
         * here and on their cursor. It is an **inline `boxShadow` rather than a ring
         * utility**, for two reasons: the colour is a value that arrived over the
         * wire, so there is no class for it, and `AvatarGroup` already sets
         * `ring-2 ring-background` on its children through a variant whose selector
         * outranks a plain class on this element — an inline declaration is what
         * replaces it rather than losing to it.
         *
         * It also does the job the dark canvas needs: a 2px ring separates
         * overlapping avatars and keeps a dark profile picture from dissolving into
         * the surface behind it.
         */
        boxShadow: `0 0 0 2px ${color}`,
      }}
    >
      {/*
       * `alt=""` because the accessible name is on the root, as in the share dialog's
       * rows: a second name here would be announced twice.
       */}
      {avatar ? <AvatarImage src={avatar} alt="" /> : null}
      <AvatarFallback className="text-xs">{initialsOf(name)}</AvatarFallback>
    </Avatar>
  );
}

/**
 * The initials shown while an image loads, or for a collaborator whose Clerk profile
 * carries no picture at all.
 *
 * Up to two letters, taken from the first and last words of the display name, so
 * "Ada Lovelace" reads as `AL` and a single-word name as one letter. The name always
 * resolves — the auth route falls back through Clerk's own fields to a fragment of
 * the user ID — so this cannot come out empty for a real session.
 */
function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return "?";
  }

  const first = words[0].charAt(0);
  const last = words.length > 1 ? words[words.length - 1].charAt(0) : "";

  return `${first}${last}`.toUpperCase();
}
