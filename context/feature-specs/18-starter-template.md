# IA Starter Templates

Add a small starter template library so users can start from a predefined IA solution architecture instead of building every canvas from scratch.

These templates are for the high-level solution architecture canvas only.

Do not add detailed Design Studio process or Business Object templates in this unit.

Preserve the collaborative canvas architecture and the node/edge model established in Units 12–17.

## Implementation

1. Create:

   `features/canvas/starter-templates.ts`

   Include:

   - a `CanvasTemplate` type
   - a `CANVAS_TEMPLATES` array

   Reuse the existing:

   - shared canvas types
   - `canvas-components.ts`
   - `canvas-node-tokens.ts`
   - `canvas-edge-tokens.ts`
   - component types
   - node color model
   - `canvasNode` and `canvasEdge` types

   Do not duplicate existing component-to-shape, component-to-size, node styling, or edge styling rules.

2. Add at least these three templates:

   ### WorkHQ Agentic Workflow

   Example high-level flow:

   `Trigger → Action → Agent → Human Task → Connector`

   ### Design Studio Queue Processing

   Example high-level flow:

   `Work Queue → Design Studio Process → Business Object → External Application`

   ### Hybrid WorkHQ + Digital Worker

   Example high-level flow:

   `WorkHQ Trigger → WorkHQ Action → Digital Worker → Design Studio Process → Business Object → External Application`

   Each template should include:

   - id
   - name
   - description
   - nodes
   - edges

   Template nodes should use the existing IA component types, mapped shapes, sizes, colors, and node data structure.

   Template edges should use the existing `canvasEdge` structure.

   Keep templates as high-level architecture examples only.

3. Keep template definitions immutable.

   Template node and edge IDs may be stable local IDs inside the template definition.

   When importing a template:

   - create fresh runtime node IDs
   - create fresh runtime edge IDs
   - remap every edge source and target to the new node IDs
   - do not mutate the objects stored in `CANVAS_TEMPLATES`

   Reuse existing ID-generation helpers where appropriate rather than creating conflicting ID conventions.

4. Create:

   `features/canvas/starter-templates-modal.tsx`

   The modal should:

   - use the existing Dialog primitive
   - show template cards in a scrollable grid
   - show the template name
   - show the template description
   - show a lightweight diagram preview
   - include an import button for each template
   - call `onImport` with the selected template and then close

5. Add lightweight template previews.

   For each template card:

   - fit the diagram into a fixed-size preview area
   - calculate preview bounds from the template node positions
   - draw edges as simple lines between node centres
   - render nodes using their existing shape and color information
   - reuse existing shape/token helpers where practical
   - do not create a React Flow instance
   - do not connect the preview to Liveblocks

   Template previews are local, read-only UI.

6. Wire starter templates into the editor.

   Add a Templates entry point to the existing editor navbar.

   Preserve the existing workspace structure:

   - keep `/editor/[projectId]` server-side
   - do not move project fetching to the client
   - use the existing client editor/canvas boundary for modal state and import behaviour

7. Import the selected template into the collaborative canvas.

   When a template is imported:

   - create fresh runtime nodes and edges from the selected template
   - replace all existing canvas nodes and edges
   - do not add the template on top of the current architecture
   - perform the replacement through the existing Liveblocks-backed canvas state flow
   - do not create a second local copy of canvas state
   - do not change the `initial` nodes or edges passed to `useLiveblocksFlow`
   - do not remount the Liveblocks room to perform the import

8. Make template replacement one undoable operation.

   - group clearing the existing canvas and adding the template into one Liveblocks history operation
   - use the same safe pause/resume pattern already established for collaborative editing
   - ensure history is always resumed
   - one Undo should restore the architecture that existed before the template import

9. Fit the canvas after import.

   Once the imported nodes are available:

   - use the existing React Flow instance to fit the imported architecture into view
   - reuse the existing fit-view options from `canvas-control-tokens.ts`
   - do not persist or collaboratively sync the resulting viewport

## Scope Limits

- don't add template saving
- don't add user-created templates
- don't add template editing
- don't add detailed Design Studio process templates
- don't add detailed Business Object templates
- don't add server persistence for template definitions
- don't change node rendering
- don't change edge rendering
- don't change the component panel
- don't change node or edge editing
- don't add AI-generated templates yet
- don't add template categories or search yet
- keep this focused on importing predefined high-level IA architectures

## Check When Done

- IA templates use the existing shared canvas model
- template cards show lightweight previews
- importing creates fresh runtime node and edge IDs
- import replaces the existing collaborative canvas
- one Undo restores the previous canvas
- imported architecture fits into view
- editor navbar includes the Templates entry point
- `npm run build` passes