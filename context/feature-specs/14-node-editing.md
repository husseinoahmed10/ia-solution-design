# Node Editing

Add resizing and inline label editing to the existing canvas nodes.

Preserve the Unit 13 rendering structure:

- `canvas-node-body.tsx` owns the reusable node visual body
- `canvas-node.tsx` owns React Flow-specific node behaviour
- `canvas-node-shape.tsx` owns shape geometry
- `canvas-node-tokens.ts` owns shared node sizing and visual tokens

Do not collapse or duplicate these responsibilities.

## Implementation

1. Add resizing using React Flow's `NodeResizer`.

   - add resizing at the `canvas-node.tsx` level
   - show resize handles only when a node is selected
   - keep resize handles subtle and consistent with the dark canvas UI
   - prevent nodes from being resized below sensible minimum dimensions
   - centralize minimum dimensions in the existing canvas token system rather than hard-coding them in the renderer
   - keep circle nodes square while resizing
   - allow all existing SVG shapes and the shared node body to scale with the resized dimensions
   - preserve the selected outline behavior added in Unit 13

   Keep width and height connected to the existing Liveblocks-backed React Flow state.

   Do not create a second local or persisted copy of node dimensions.

   Do not add manual history handling for resize gestures if the existing Liveblocks React Flow integration already handles them as a single history operation.

2. Add inline label editing.

   - keep the normal label rendering in `canvas-node-body.tsx`
   - double-click the node label area to start editing
   - show a textarea directly over the existing centered label position
   - initialise it with the current node label
   - keep the editor centered without causing layout shifts
   - update the node label through the existing collaborative node data flow as the user types
   - close editing on blur or `Escape`
   - `Escape` should close editing without introducing separate local node state or reverting already-synced changes
   - show subtle centered placeholder text when the label is empty
   - prevent textarea interactions from dragging the node or panning the canvas
   - use the appropriate React Flow interaction classes such as `nodrag` and `nopan`

3. Group each label editing session into one Liveblocks history operation.

   - pause history when editing starts
   - resume history when editing ends
   - ensure history is also resumed if the editor unmounts while editing
   - do not leave Liveblocks history paused after blur, `Escape`, or cleanup

4. Keep temporary editing state local.

   Editing mode and focus state should not be stored in:

   - Liveblocks Storage
   - Liveblocks Presence
   - Prisma

   Only the resulting node label remains collaborative.

## Scope Limits

- don't change the existing shape geometry
- don't change the Unit 13 drag preview
- don't change the component panel
- don't change how dropped nodes are created
- don't change the existing node color model
- don't add a properties panel
- don't add component-specific configuration fields
- don't add edge editing yet
- keep this focused on node resizing and inline label editing

## Check When Done

- selected nodes show resize handles
- resizing updates collaborative node dimensions
- circle nodes remain circular when resized
- double-clicking enables inline label editing
- label changes sync through the collaborative state
- one label editing session behaves as one undo operation
- `npm run build` passes