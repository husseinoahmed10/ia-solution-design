"use client";

import { useLiveblocksFlow } from "@liveblocks/react-flow";
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import { useCallback, type DragEvent } from "react";

import { CanvasComponentToolbar } from "@/features/canvas/canvas-component-toolbar";
import { CanvasControlBar } from "@/features/canvas/canvas-control-bar";
import { canvasFitViewOptions } from "@/features/canvas/canvas-control-tokens";
import {
  hasCanvasComponentDragPayload,
  readCanvasComponentDragPayload,
} from "@/features/canvas/canvas-drag-payload";
import { canvasEdgeTypes } from "@/features/canvas/canvas-edge";
import { canvasEdgeDefaults } from "@/features/canvas/canvas-edge-tokens";
import { createCanvasNodeId } from "@/features/canvas/canvas-node-id";
import { DEFAULT_CANVAS_NODE_COLOR } from "@/features/canvas/canvas-node-tokens";
import { canvasNodeTypes } from "@/features/canvas/canvas-node";
import { useStarterTemplatesContext } from "@/features/canvas/starter-templates-context";
import { StarterTemplatesModal } from "@/features/canvas/starter-templates-modal";
import { useCanvasTemplateImport } from "@/hooks/use-canvas-template-import";
import type { CanvasEdge, CanvasNode } from "@/types/canvas";

/*
 * React Flow's base stylesheet, which carries the viewport, handle, panel, and
 * background-pattern rules, plus the `.react-flow.dark` block that redefines the
 * `--xy-*` defaults. The full `style.css` is still not imported: it styles the
 * default node chrome and React Flow's own `Controls` component, and neither is
 * rendered — the custom node brings its own shape and handle styling, and the
 * control bar is this application's own `Panel`.
 *
 * A stylesheet from an external package may be imported from a colocated
 * component like this one, so it loads with the canvas rather than on every page.
 */
import "@xyflow/react/dist/base.css";

/**
 * The architecture canvas — React Flow driven entirely by Liveblocks Storage.
 *
 * The `ReactFlowProvider` is here rather than inside `<ReactFlow>`'s own wrapper
 * because the drop handler needs `screenToFlowPosition`, which reads the viewport
 * from React Flow's store, and that store has to exist in a component *above* the
 * flow. `<ReactFlow>` reuses an existing store when it finds one, so there is still
 * only one.
 */
export function ArchitectureCanvas() {
  return (
    /*
     * React Flow sets `width: 100%; height: 100%` on its own wrapper and a caller
     * cannot override that through `style`, so filling the workspace is a matter
     * of this parent resolving to a height. The canvas region is `min-h-0 flex-1`,
     * which gives `h-full` here something to resolve against.
     */
    <div className="h-full w-full bg-background">
      <ReactFlowProvider>
        <CollaborativeFlow />
      </ReactFlowProvider>
    </div>
  );
}

/**
 * The flow itself.
 *
 * `useLiveblocksFlow` owns the state. It is the controlled-flow pattern: the
 * nodes and edges it returns come from the room's `flow` tree, and the four
 * handlers write back to it, so every change is broadcast to the other people in
 * the project and conflicts are resolved by Liveblocks rather than here. There is
 * no local `useNodesState`, and no second copy of the diagram to keep in sync —
 * which is why a drop adds its node through `onNodesChange` too.
 *
 * Storage is the only home for canvas state. Nothing is written to PostgreSQL or
 * blob storage.
 *
 * `suspense: true` means `nodes` and `edges` are always arrays here — the hook
 * suspends until Storage has loaded, and the `ClientSideSuspense` in the room
 * wrapper shows the loading state meanwhile — so there is no `isLoading` branch
 * to render.
 */
function CollaborativeFlow() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      suspense: true,
      /*
       * An empty diagram. `initial` is written to Storage only when the room has
       * no `flow` yet, so this is the state of a project nobody has drawn in and
       * never an overwrite of an existing canvas.
       */
      nodes: { initial: [] },
      edges: { initial: [] },
    });

  const { screenToFlowPosition } = useReactFlow();

  /*
   * Whether the starter template picker is open, from the editor shell — the picker
   * is opened by the navbar, which is outside this route's tree, so the flag arrives
   * through the context the shell provides.
   *
   * The **import** is created here, and only here, because it needs exactly what this
   * component holds: the room's current nodes and edges, the Liveblocks mutations that
   * replace them, and the React Flow instance that frames the result.
   */
  const starterTemplates = useStarterTemplatesContext();

  const importTemplate = useCanvasTemplateImport({
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onDelete,
  });

  /*
   * A drop target has to say so on every `dragover`, not once: the browser's default
   * for the event is to refuse the drop, so without `preventDefault` here the drop
   * never fires. The check keeps that acceptance to component drags, so dragging a
   * file or a text selection over the canvas still shows the browser's own "no".
   */
  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    if (!hasCanvasComponentDragPayload(event.dataTransfer)) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }, []);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      const payload = readCanvasComponentDragPayload(event.dataTransfer);

      /*
       * Not one of ours, or a payload that failed validation — a stale message from
       * an older tab, say. Nothing is created and the event is left alone, so the
       * browser handles it as it normally would.
       */
      if (!payload) {
        return;
      }

      event.preventDefault();

      /*
       * The pointer is in screen coordinates and a node's position is in canvas
       * coordinates, which differ by the pan and the zoom, so React Flow converts
       * it. The result is offset by half the node so the component lands centred
       * under the cursor rather than with its top-left corner there.
       */
      const dropPosition = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const node: CanvasNode = {
        id: createCanvasNodeId(payload.componentType),
        type: "canvasNode",
        position: {
          x: dropPosition.x - payload.defaultWidth / 2,
          y: dropPosition.y - payload.defaultHeight / 2,
        },
        width: payload.defaultWidth,
        height: payload.defaultHeight,
        data: {
          /* The component's own name is the starting label; renaming comes later. */
          label: payload.label,
          color: DEFAULT_CANVAS_NODE_COLOR,
          shape: payload.shape,
          componentType: payload.componentType,
        },
      };

      /*
       * An `add` change rather than a `setNodes` call. `useLiveblocksFlow` owns the
       * state, and this handler is what writes into the room's `flow` tree, so the
       * node is in Storage and broadcast to everyone else as soon as it is dropped.
       */
      onNodesChange([{ type: "add", item: node }]);
    },
    [onNodesChange, screenToFlowPosition]
  );

  return (
    <ReactFlow<CanvasNode, CanvasEdge>
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      /*
       * `onDelete` rather than only the change handlers: React Flow reports a
       * deletion here with the nodes *and* the edges that went with it, so
       * removing a component takes its connections out of Storage in the same
       * mutation instead of leaving edges pointing at nothing.
       */
      onDelete={onDelete}
      /*
       * The drag-and-drop handlers go on `<ReactFlow>` itself, which forwards
       * unknown div attributes to its root element, so the drop target is exactly
       * the area a component can be dropped on.
       */
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      /* The renderer for the `canvasNode` type every node on this canvas has. */
      nodeTypes={canvasNodeTypes}
      /* And for the `canvasEdge` type every connection has. */
      edgeTypes={canvasEdgeTypes}
      /*
       * What a new connection resolves to. React Flow merges these into the
       * connection *before* `onConnect` runs, so a dragged edge reaches Storage as a
       * `canvasEdge` with an empty label and an arrowhead through the existing
       * Liveblocks mutation — there is no second edge-creation path here that would
       * have to repeat the same defaults.
       */
      defaultEdgeOptions={canvasEdgeDefaults}
      /*
       * Loose connections. An architecture diagram is drawn by dragging between
       * components, and strict mode would refuse a source-to-source drag — which
       * to the person drawing it is the same connection in the other direction.
       */
      connectionMode={ConnectionMode.Loose}
      fitView
      /*
       * A floor under `fitView` on an empty or single-component canvas. Without it,
       * fitting one node fills the viewport with it, and the first component
       * somebody drops would jump to an enormous zoom.
       *
       * The options come from the shared token map rather than from a literal here,
       * so the control bar's fit-view button lands the canvas in the same place this
       * first fit does.
       */
      fitViewOptions={canvasFitViewOptions}
      /*
       * The dark `--xy-*` values live behind `.react-flow.dark`, and this prop is
       * what puts that class on the root. The application is dark-only, so the
       * value is fixed rather than read from a theme.
       */
      colorMode="dark"
    >
      {/*
       * The dot-pattern background takes its colour as a `var(--token)` reference to
       * the palette in `globals.css` rather than as a literal value, so the canvas
       * follows the same tokens as the rest of the interface.
       */}
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--border)" />

      {/*
       * Zoom, fit view, and Liveblocks undo/redo, bottom-left. It also mounts the
       * keyboard shortcuts, because it is where all four actions a shortcut runs are
       * already gathered.
       *
       * There is no `MiniMap`. An overview of the whole diagram is a navigation aid
       * for a canvas larger than the viewport, and fit view now covers finding one's
       * way back; keeping both would leave two overlays competing for the same
       * corners as the component toolbar.
       */}
      <CanvasControlBar />

      <CanvasComponentToolbar />

      {/*
       * The starter template picker.
       *
       * It is mounted here because this is where the import lives, and it costs the
       * canvas nothing: the dialog renders **no DOM inside the flow** — Radix portals
       * its content to the document body — so unlike the two panels above it, it is
       * not an overlay on the viewport and needs no `nodrag nopan nowheel`.
       *
       * Which means it is mounted for exactly as long as the canvas is, so the picker
       * cannot be open without something to import into.
       */}
      <StarterTemplatesModal
        open={starterTemplates.isOpen}
        onOpenChange={starterTemplates.setDialogOpen}
        onImport={importTemplate}
      />
    </ReactFlow>
  );
}
