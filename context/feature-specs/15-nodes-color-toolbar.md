# Node Color Toolbar

Add a small floating color toolbar so selected nodes can use predefined visual color themes.

Extend the existing `CanvasNodeColor` and `canvas-node-tokens.ts` rather than introducing a separate color system.

Preserve the Unit 14 node structure:

- `canvas-node.tsx` owns React Flow-specific node behaviour
- `canvas-node-body.tsx` owns the reusable node visual body and label rendering
- `canvas-node-shape.tsx` owns shape geometry
- `canvas-node-tokens.ts` owns shared node sizing and visual tokens

Do not duplicate color or styling logic across these files.

## Implementation

1. Extend the existing node color palette.

   Support these predefined color keys:

   - default
   - blue
   - green
   - amber
   - red

   Use the existing IA Solution Design theme colors where possible.

   Each color key should resolve through the existing canvas token system to a matching:

   - background color
   - text color
   - border color

   Store only the color key in node data.

   Do not store separate background, text, or border color values on each node.

   Colors are visual choices only and must not represent WorkHQ or Design Studio semantics yet.

2. Update the existing node rendering to use the active color token.

   - apply the selected background color to the node body
   - apply the paired text color to the node label
   - apply the paired border color to the existing shape outline
   - preserve the brighter selected-state treatment introduced in Unit 13
   - preserve resizing and label editing from Unit 14

3. Add a floating toolbar above selected nodes using React Flow's `NodeToolbar`.

   - add it at the `canvas-node.tsx` level
   - only show it when the node is selected
   - position it slightly above the node without overlapping it
   - show one swatch for each predefined color
   - clearly indicate the active swatch
   - keep hover effects subtle and consistent with the dark UI
   - prevent toolbar interactions from dragging the node or panning the canvas
   - use the appropriate React Flow interaction classes such as `nodrag` and `nopan`

4. When a swatch is selected:

   - update only the node's existing `color` value
   - update through the existing Liveblocks-backed node data flow
   - update the node immediately for all collaborators
   - make no server API calls
   - do not create a second local copy of node color state

5. Keep toolbar visibility local.

   Selection and toolbar-open state must not be stored in:

   - Liveblocks Storage
   - Liveblocks Presence
   - Prisma

   Only the resulting node color is collaborative.

## Scope Limits

- don't change drag/drop behaviour
- don't change the component panel or drag preview
- don't change node resizing
- don't change label editing
- don't add a full color picker
- don't add custom user-defined colors
- don't assign architectural meaning to colors
- don't add component-specific styling rules yet
- don't add a properties panel
- keep this focused on predefined node color themes

## Check When Done

- predefined node color themes exist
- selected nodes show the floating color toolbar
- selecting a swatch updates the collaborative node color
- node background, text, and border styling come from the shared token system
- Unit 13 selection styling is preserved
- Unit 14 resizing and label editing still work
- `npm run build` passes