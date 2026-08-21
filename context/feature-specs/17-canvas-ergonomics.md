# Canvas Ergonomics

Add a floating canvas control bar for zoom and collaborative undo/redo, then wire the same actions to keyboard shortcuts.

Preserve the collaborative canvas, node, and custom edge architecture established in the previous units.

## Implementation

1. Add a pill-shaped control bar at the bottom-left of the canvas.

   Use the existing React Flow `Panel` pattern where appropriate.

   Keep it clear of the existing bottom-center component panel.

   Include two groups:

   ### Zoom

   - zoom out
   - fit view
   - zoom in

   ### History

   - undo
   - redo

   Separate the two groups with a subtle divider.

   Keep the controls consistent with the existing dark canvas UI.

2. Wire zoom controls to the existing React Flow instance.

   Support:

   - zoom in
   - zoom out
   - fit view

   Use the React Flow viewport methods rather than manipulating transform state directly.

   Use a short animation duration so viewport changes feel smooth.

3. Wire undo and redo to Liveblocks history.

   Use the existing Liveblocks hooks for:

   - undo
   - redo
   - can undo
   - can redo

   Follow the Liveblocks hook/import pattern already used by the project.

   - disable undo when there is nothing to undo
   - disable redo when there is nothing to redo
   - keep disabled buttons visually dimmed
   - do not create a separate history stack
   - do not use React Flow's local state as an alternative history system

4. Create:

   `hooks/use-keyboard-shortcuts.ts`

   The hook should receive the React Flow viewport actions and Liveblocks undo/redo actions it needs.

   Listen for keyboard shortcuts on `window`.

   Ignore canvas shortcuts when the event target is, or is inside:

   - an input
   - a textarea
   - a select
   - a contenteditable element

   This must preserve the node label editing from Unit 14 and edge label editing from Unit 16.

5. Support these shortcuts:

   - `+` or `=` → zoom in
   - `-` → zoom out
   - `Cmd/Ctrl + Z` → undo
   - `Cmd/Ctrl + Shift + Z` → redo
   - `Cmd/Ctrl + Y` → redo

   For zoom shortcuts:

   - handle the unmodified `+`, `=`, and `-` canvas shortcuts
   - allow `Shift` where required to type `+`
   - do not treat `Cmd/Ctrl + =` or `Cmd/Ctrl + -` as canvas zoom shortcuts

   Call `preventDefault()` only when a canvas shortcut is actually handled.

6. Remove the existing `MiniMap`.

   Keep the existing dot-pattern background.

7. Preserve the existing canvas architecture.

   Do not change:

   - `useLiveblocksFlow`
   - collaborative node or edge state
   - custom `canvasNode` rendering
   - custom `canvasEdge` rendering
   - connection handling
   - node/edge editing
   - component drag/drop
   - color behaviour

## Scope Limits

- don't change the component panel
- don't change node rendering
- don't change edge rendering
- don't add additional canvas controls
- don't add a separate history implementation
- don't persist viewport state
- don't add collaborative viewport syncing
- don't change the existing Liveblocks state architecture
- keep this focused on navigation and undo/redo ergonomics

## Check When Done

- canvas control bar is present
- zoom and fit-view actions use the React Flow instance
- undo and redo use Liveblocks history
- disabled history states update correctly
- keyboard shortcuts work without interfering with text editing
- MiniMap is removed
- `npm run build` passes