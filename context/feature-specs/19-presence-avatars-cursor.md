# Presence Avatars and Live Cursors

Show active collaborators inside the project canvas view.

Keep the existing editor home navbar and shared navbar behaviour unchanged.

This unit only adds presence UI to an open `/editor/[projectId]` workspace.

## Implementation

1. Preserve the existing navbar behaviour.

   - do not change the editor home navbar
   - do not move participant presence into the shared navbar globally
   - keep existing project navbar actions unchanged
   - presence UI should only appear when a project canvas room is open

2. Add a participant group inside the canvas area.

   Position it in the top-right corner of the canvas view.

   Keep it visually separate from the main navbar actions.

   Render:

   - active collaborator avatars from Liveblocks
   - the current user separately using the existing Clerk `UserButton`

   Use Liveblocks `useOthers` for collaborators so the current user is not rendered twice.

   Keep collaborator avatars and the Clerk `UserButton` visually consistent in size.

   Collaborator avatars are display-only.

   If collaborators are present:

   - show their avatars
   - show a subtle divider
   - show the current user's `UserButton`

   If no collaborators are present:

   - show only the current user's `UserButton`
   - do not show the divider

3. Render collaborator avatars.

   Use the existing Liveblocks user metadata:

   - display name
   - avatar URL
   - cursor color

   For each collaborator:

   - use the avatar image when available
   - fall back to initials when no image is available
   - add a subtle ring so the avatar remains visible on the dark canvas

   Show up to five collaborator avatars in an overlapping stack.

   If more than five collaborators are connected, show a `+N` overflow indicator.

4. Add live cursor presence to the canvas.

   Preserve the existing presence shape in `liveblocks.config.ts`.

   Presence remains:

   - `cursor: { x: number; y: number } | null`
   - `isThinking: boolean`

   Do not rename `isThinking`.

5. Broadcast the current user's cursor position.

   Cursor position should use React Flow coordinates rather than raw browser coordinates.

   When the pointer moves over the canvas:

   - convert the pointer position from screen coordinates to React Flow coordinates using the existing React Flow instance
   - update Liveblocks presence with the resulting flow-space cursor position

   When the pointer leaves the canvas:

   - set `cursor` to `null`

   Do not store cursor movement in Liveblocks Storage or Prisma.

6. Render cursors for other collaborators.

   Use the existing Liveblocks presence state for other users.

   Never render the current user's own cursor.

   For each remote cursor:

   - read its saved flow-space coordinates
   - convert those coordinates to the current viewer's screen/canvas position using the React Flow instance
   - render a small cursor pointer
   - render the collaborator's display name next to the pointer
   - use the collaborator's existing cursor color for the pointer and name badge

   Cursor rendering must remain correct when collaborators have different zoom or pan positions.

7. Keep cursor UI local to the current viewport.

   Only cursor coordinates are collaborative presence data.

   Do not collaboratively sync:

   - zoom
   - pan
   - viewport position
   - hover state
   - selection state

## Scope Limits

- don't add participant avatars to the shared navbar globally
- don't remove or redesign existing navbar actions
- don't replace Clerk profile or logout behaviour
- don't make collaborator avatars interactive
- don't add participant menus
- don't add cursor trails
- don't add comments or notifications
- don't change node or edge behaviour
- don't change collaborative canvas Storage
- don't change `isThinking` behaviour yet
- keep this focused on participant presence and live cursors

## Check When Done

- presence UI only appears in an open project canvas
- current user is shown once using Clerk `UserButton`
- collaborator avatars come from Liveblocks `useOthers`
- collaborator overflow is handled
- cursor coordinates are broadcast through Liveblocks Presence
- remote cursors render using flow coordinates
- current user's cursor is not rendered
- `npm run build` passes