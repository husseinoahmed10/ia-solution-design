Replace the canvas placeholder with a Liveblocks-backed React Flow canvas.

## Implementation

1. Keep the `/editor/[projectId]` workspace page server-side.

2. Create a client-side editor/canvas wrapper that sets up the Liveblocks room.

It should include:

* `LiveblocksProvider` using `/api/liveblocks-auth`
* `RoomProvider` using the current project ID as the room ID
* initial presence with `cursor: null`
* `ClientSideSuspense` with a simple loading state
* an error fallback for Liveblocks connection issues

The database project ID, workspace ID, and Liveblocks room ID remain the same.

3. Wire React Flow to Liveblocks state.

* use `useLiveblocksFlow`
* enable suspense
* start with empty nodes and edges
* pass the synced nodes, edges, and change handlers into `ReactFlow`
* include `onConnect` and `onDelete` from `useLiveblocksFlow`

4. Add shared canvas types in `types/canvas.ts`.

Node data should support:

* label
* color
* shape

Define the custom node and edge types:

* `canvasNode`
* `canvasEdge`

Keep these types generic for now. WorkHQ and Blue Prism-specific node types will be added in a later feature.

5. Render the basic canvas.

Include:

* loose connection behavior
* `fitView`
* `MiniMap`
* dot-pattern background
* React Flow base styles

The canvas should fill the available central workspace area.

## Scope Limits

* don’t add controls yet
* don’t add custom node or edge rendering yet
* don’t add realtime cursor UI yet
* don’t add separate database or blob canvas persistence
* don’t add AI behavior
* don’t add WorkHQ or Blue Prism-specific nodes yet
* keep this focused on the collaborative canvas foundation

## Check When Done

* client canvas wrapper sets up the Liveblocks room
* React Flow uses Liveblocks-synced nodes and edges
* shared canvas types exist in `types/canvas.ts`
* project ID is used as the Liveblocks room ID
* `npm run build` passes
