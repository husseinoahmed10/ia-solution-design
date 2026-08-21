Add a bottom component panel so users can drag IA solution components onto the canvas and create new nodes.

The component shapes are IA Solution Design visual conventions for high-level architecture. They are not intended to reproduce the native WorkHQ or Design Studio UI.

`Design Studio Process` and `Business Object` nodes represent high-level architecture components and will open into separate detailed design canvases in later features.

Note: Liveblocks keys are in .env.locak now.

## Implementation

1. Add a floating pill-shaped toolbar at the bottom-center of the canvas.

2. Add draggable component buttons grouped into:

### WorkHQ

* Trigger
* Action
* Agent
* Human Task
* Connector
* Digital Worker

### Design Studio

* Process
* Business Object
* Work Queue

### Shared

* API
* Database
* External Application
* Human Actor

3. Map each component to a default shape:

* WorkHQ Trigger → circle
* WorkHQ Action → rectangle
* WorkHQ Agent → hexagon
* WorkHQ Human Task → pill
* WorkHQ Connector → hexagon
* Digital Worker → pill
* Design Studio Process → pill
* Design Studio Business Object → rectangle
* Work Queue → cylinder
* API → hexagon
* Database → cylinder
* External Application → rectangle
* Human Actor → circle

4. When dragging a component, include the following in the drag payload:

* component type
* label
* shape
* default width
* default height

Use sensible default sizes:

* rectangles and pills should be wider than tall
* circles should be square
* cylinders should be wide enough for labels
* hexagons should be slightly larger for readability

5. Update `types/canvas.ts`.

Node data should support:

* label
* color
* shape
* componentType

Define the supported IA component types as a TypeScript union.

Keep the existing shape type capable of supporting:

* rectangle
* diamond
* circle
* pill
* cylinder
* hexagon

`diamond` is retained for future decision and branching components but does not need a toolbar component in this unit.

6. Add `dragover` and `drop` handling to the canvas wrapper.

7. On drop:

* read the dragged component payload
* convert the screen position to canvas coordinates using React Flow
* create a new node at that position
* use the component name as the default label
* use the default node color
* store the component type
* store the mapped shape
* use the supplied default size
* add the node through the existing Liveblocks-backed React Flow state

8. Generate each node ID using the component type, timestamp, and a counter.

9. Add a basic renderer for the custom `canvasNode` type so new nodes are visible.

For this unit, render nodes with their basic mapped shape, border, and centered label.

Do not add detailed WorkHQ or Design Studio stage rendering yet.

## Scope Limits

* don’t add component property editing yet
* don’t add detailed Design Studio stages such as Start, End, Action, Page, Decision, Choice, Read, Write, Navigate, or Exception yet
* don’t add detailed Business Object actions yet
* don’t add WorkHQ-specific configuration forms yet
* don’t add component validation rules yet
* don’t add AI behavior
* don’t add drill-down navigation yet
* keep this focused on drag-and-drop creation of high-level IA architecture components

## Check When Done

* toolbar contains WorkHQ, Design Studio, and shared components
* drag payload includes component type, shape, and size
* dropping creates a Liveblocks-synced typed canvas node
* nodes render using their mapped basic shape
* `npm run build` passes without type errors
