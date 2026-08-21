# Edge Behavior

Replace the basic canvas edges with custom collaborative edges that are easier to follow, select, and label.

Preserve the existing node architecture from Units 13–15.

Before changing connection handles, inspect the existing handle implementation in `canvas-node.tsx`.

Do not duplicate handles that already exist. Reuse or adjust the existing handle layer so each node ends up with exactly the required four connection handles.

## Implementation

1. Configure connection handles on every canvas node.

   Each node should have handles on:

   - top
   - right
   - bottom
   - left

   Keep the existing `ConnectionMode.Loose`.

   Do not introduce strict source/target side semantics.

   Users should be able to create connections using any of the four handles.

   Handles should:

   - use stable side-based IDs
   - be small white dots with a dark border
   - stay subtle at rest
   - fade in when the node is hovered or selected
   - remain mounted when visually hidden
   - use opacity or visibility rather than `display: none`

   Keep handle behaviour at the `canvas-node.tsx` level.

2. Add the custom canvas edge type.

   Reuse the existing shared `canvasEdge` type rather than introducing a second edge model.

   Extend its data to support:

   - `label`

   Treat a missing label as an empty string so existing edges remain compatible.

3. Add defaults for new edges.

   New connections should resolve to:

   - type: `canvasEdge`
   - empty label
   - light stroke with rounded ends
   - arrowhead at the target end
   - suitable interaction width so the edge is easier to select without increasing its visible thickness

   Reuse the existing Liveblocks `onConnect` flow.

   Do not introduce separate local edge state or a second edge creation path.

   Use React Flow edge defaults where appropriate rather than duplicating visual defaults on every edge.

4. Create the custom `canvasEdge` renderer.

   Use:

   - `BaseEdge`
   - `getSmoothStepPath`
   - `EdgeLabelRenderer`

   Use clean right-angle routing.

   Edges should:

   - appear slightly dimmed at rest
   - brighten when hovered or selected
   - use a light stroke
   - use rounded stroke ends
   - show an arrowhead at the target
   - have a larger invisible interaction area without making the visible line thicker
   - remain consistent with the existing dark canvas UI

   Use the path returned by `getSmoothStepPath`.

5. Add edge label rendering.

   Use the `labelX` and `labelY` coordinates returned by `getSmoothStepPath`.

   Do not manually calculate the path midpoint.

   When an edge has a saved label:

   - show it as a small pill badge centred on the path label position

   When a selected edge has no label:

   - show a faint label hint at the same position

6. Add inline edge label editing.

   - double-click the edge or its label area to start editing
   - position the editor using `EdgeLabelRenderer`
   - use the path-provided label coordinates
   - use an input that grows with the label text
   - initialise it from the current edge label
   - update the label through the existing collaborative edge data flow
   - close editing on blur
   - close editing on Enter
   - close editing on `Escape`
   - prevent label interactions from dragging or panning the canvas

   Interactive elements inside `EdgeLabelRenderer` should:

   - enable pointer events
   - use `nodrag`
   - use `nopan`

7. Group each edge label editing session into one Liveblocks history operation.

   Follow the same safe history pattern established for node label editing in Unit 14:

   - pause history when editing begins
   - resume history when editing ends
   - guard against duplicate pause/resume calls
   - ensure history resumes on blur, Enter, Escape, or unmount cleanup

   Only the resulting edge label should be collaborative.

   Editing mode and focus state should remain local.

8. Preserve the existing collaborative canvas architecture.

   Continue using the existing:

   - `useLiveblocksFlow`
   - collaborative nodes
   - collaborative edges
   - `onNodesChange`
   - `onEdgesChange`
   - `onConnect`
   - `onDelete`

   Do not create another node or edge store.

## Scope Limits

- don't change how nodes are created
- don't change the component panel
- don't change the drag preview
- don't change node resizing
- don't change node label editing
- don't change node colour behaviour
- don't redesign node rendering beyond the required connection handles
- don't add semantic connection validation yet
- don't add architectural relationship types such as invokes, uses, reads, or writes yet
- don't add edge colours or styles by relationship type yet
- keep this focused on edge rendering, connection behaviour, selection, and labels

## Check When Done

- nodes have four usable connection handles
- existing loose connection behaviour is preserved
- new edges render as `canvasEdge` with arrowheads
- custom edges use smooth right-angle routing
- edges are easy to select without a thicker visible stroke
- edge labels update through collaborative state
- interactive edge labels do not trigger canvas drag or pan
- one edge label editing session behaves as one undo operation
- `npm run build` passes