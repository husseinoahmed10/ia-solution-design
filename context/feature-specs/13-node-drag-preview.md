# Node Drag Preview and Selection Polish

Add a drag preview and selected-state polish to the existing canvas node rendering.

The six node shapes are already implemented in `features/canvas/canvas-node-shape.tsx`.

Do not replace or restructure the existing shape renderer.

## Implementation

1. Polish the existing node selection state.

   - keep borders subtle at rest
   - selected nodes should have a brighter, clearly visible border
   - all existing shapes must continue to scale with the node size
   - preserve the existing component type, shape, size, label, and color data

2. Add a component drag preview.

   When dragging a component from the bottom component panel:

   - show a ghost preview attached to the cursor
   - use the existing shape rendering where practical
   - use the same component label as the dragged component
   - use the same shape from the existing drag payload
   - use the same width and height from the existing drag payload
   - use the default node color
   - keep the preview slightly transparent
   - remove the preview after drop or drag cancellation

3. Keep the preview local to the current client.

   - do not write drag-preview state to Liveblocks Storage
   - do not write drag-preview state to Liveblocks Presence

4. Keep the existing drag/drop behavior unchanged.

   The existing validated drag payload and Liveblocks-backed node creation flow remain the source of truth.

## Scope Limits

- don't rebuild the component panel
- don't replace the existing SVG shape renderer
- don't change how dropped nodes are created
- don't add resizing or label editing yet
- don't add component-specific configuration
- keep this focused on drag preview and selection polish

## Check When Done

- existing shapes still render correctly
- selected nodes have clear visual feedback
- dragging shows a preview matching the component shape and size
- existing collaborative drop behavior is unchanged
- `npm run build` passes