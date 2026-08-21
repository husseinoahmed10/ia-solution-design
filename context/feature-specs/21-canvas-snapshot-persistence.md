# Canvas Snapshot Persistence

Add secondary JSON snapshot persistence for the collaborative architecture canvas.

Liveblocks Storage remains the authoritative source of truth for the active canvas.

Vercel Blob stores secondary snapshots for future recovery, export, audit, and AI context.

Prisma stores only the URL/path of the latest snapshot.

Do not load a Blob snapshot into the Liveblocks room automatically in this unit.

## Storage Model

Keep the responsibilities separate:

- Liveblocks Storage → authoritative collaborative canvas state
- Vercel Blob → secondary JSON snapshot
- Prisma → project metadata and latest snapshot reference

Reuse the existing `Project.canvasJsonPath` field.

Do not add another canvas URL/path field.

## Dependencies

Use `@vercel/blob`.

Install it only if it is not already installed.

Do not create, modify, inspect, or print any environment files or secret values.

Vercel Blob credentials will be configured separately.

Code should use the server-side Vercel Blob environment configuration expected by the SDK.

A missing Blob credential must produce a clear runtime configuration error when snapshot functionality is invoked, but must not prevent `npm run build` from passing.

## Implementation

1. Add a canvas snapshot API route.

   Create:

   `PUT /api/projects/[projectId]/canvas`

   The route should:

   - require Clerk authentication
   - verify access using the existing project access helper
   - allow the project owner or an existing collaborator
   - use the project ID as the Liveblocks room ID
   - retrieve the current room Storage from Liveblocks server-side
   - request the Storage in JSON form
   - create a JSON snapshot from that authoritative room state
   - upload the JSON snapshot to Vercel Blob
   - store the returned Blob URL in the existing `Project.canvasJsonPath`
   - return a small success response

   Do not accept nodes and edges from the client as the snapshot source.

   The API should snapshot the authoritative Liveblocks room state instead.

2. Define a simple snapshot format.

   The saved JSON should include:

   - snapshot version
   - project ID
   - captured timestamp
   - Liveblocks Storage JSON

   Keep the format simple and versioned so it can be consumed later by recovery, export, standards validation, and AI features.

3. Keep Blob operations server-side.

   - never expose the Blob read/write token to the browser
   - do not upload directly from the client
   - do not return secret credentials
   - do not expose the stored Blob URL unnecessarily to the client

   Use a project-specific Blob pathname so snapshots are clearly associated with their project.

4. Add a debounced snapshot hook.

   Create:

   `hooks/use-canvas-snapshot.ts`

   The hook should observe changes to the existing collaborative nodes and edges.

   When the canvas changes:

   - debounce the snapshot request to avoid excessive writes
   - call the project canvas snapshot API
   - do not send the full canvas JSON from the client
   - let the server read the current authoritative Liveblocks Storage
   - avoid firing a snapshot immediately on initial mount when nothing has changed

   Track local snapshot status:

   - `idle`
   - `saving`
   - `saved`
   - `error`

   Snapshot status is local UI state only.

5. Add a small snapshot status indicator.

   Show the current status in the open project workspace.

   Use concise states such as:

   - `Saving…`
   - `Saved`
   - `Save failed`

   Keep it subtle and consistent with the existing editor UI.

   Do not add a new manual Save button if one does not already exist.

6. Preserve Liveblocks as the source of truth.

   Do not:

   - load Blob data into the room on editor startup
   - overwrite an empty Liveblocks canvas from a previous Blob snapshot
   - treat an empty canvas as missing data
   - maintain a second client-side canvas store
   - replace `useLiveblocksFlow`
   - change the Liveblocks room ID
   - change node or edge mutation behaviour

   An intentionally empty Liveblocks canvas is valid state.

7. Do not add snapshot recovery yet.

   The latest Blob reference should be recorded in `canvasJsonPath`, but restoring from that snapshot is a separate future feature.

   This unit only creates and records snapshots.

## Scope Limits

- don't make Vercel Blob the primary canvas store
- don't automatically restore snapshots
- don't change Liveblocks Storage
- don't change collaborative node or edge behaviour
- don't change starter templates
- don't change presence or cursors
- don't change the AI sidebar
- don't add AI logic
- don't add snapshot history UI
- don't add manual recovery UI
- don't modify environment files
- keep this focused on creating secondary canvas snapshots

## Check When Done

- Liveblocks remains the authoritative canvas state
- snapshot API reads the room state server-side
- snapshot JSON is stored in Vercel Blob
- `canvasJsonPath` stores the latest snapshot reference
- canvas changes trigger debounced snapshots
- snapshot status is visible in the workspace
- no automatic Blob-to-Liveblocks restore exists
- `npm run build` passes