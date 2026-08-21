# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- In progress

## Current Goal

- **Unit 21 — Canvas snapshot persistence
  (`context/feature-specs/21-canvas-snapshot-persistence.md`) — code
  complete (2026-08-21).** A project's canvas is now copied to a
  **secondary JSON snapshot** in Vercel Blob as it is edited, and
  **Liveblocks Storage is still authoritative**. The new
  **`PUT /api/projects/[projectId]/canvas`** takes **no request body**:
  it authenticates with Clerk, resolves access through the existing
  `resolveProjectAccess` (owner **or** collaborator; `404` for a
  missing or inaccessible project), reads the room's own Storage
  server-side via `getStorageDocument(projectId, "json")`, wraps it as
  a versioned snapshot — `version`, `projectId`, `capturedAt`, and the
  Storage JSON verbatim — uploads it to
  `projects/<projectId>/canvas.json`, and records the returned URL in
  the **existing `Project.canvasJsonPath`**. **Nodes and edges are
  never accepted from the client as the snapshot source**, and the
  response is `{ capturedAt }` — never the Blob URL. Blob work is
  entirely server-side behind the new `lib/blob.ts` adapter, written
  `access: "private"` because the pathname is guessable, with
  `BLOB_READ_WRITE_TOKEN` read at call time so a missing credential
  fails the request and not `npm run build`. **No environment file was
  created, modified, inspected, or printed.** On the client,
  `hooks/use-canvas-snapshot.ts` watches the collaborative nodes and
  edges, debounces **1500ms**, and calls the route with only the
  project ID; it detects change from a **signature over document fields
  only** (`selected`, `dragging`, and `measured` excluded), which is
  what stops a `saving`→`saved` re-render from looping forever, and it
  **fires nothing on mount** — the first snapshot of a session is the
  consequence of the first edit. Status is local UI state
  (`idle | saving | saved | error`) shown as a subtle top-left canvas
  pill: `Saving…`, `Saved`, `Save failed`, and nothing while idle.
  **No Save button was added**, and **nothing is ever loaded back into
  a room** — an empty Liveblocks canvas is valid state, and recovery is
  a later unit. `useLiveblocksFlow`, `Storage.flow`, the room ID, every
  node and edge mutation, starter templates, presence, cursors, the AI
  sidebar, and the Prisma schema are untouched; `@vercel/blob 2.8.0` is
  the one dependency added. `npx next typegen`, `npx tsc --noEmit`,
  `npm run lint`, and `npm run build` all pass, now reporting
  **twelve** routes plus `ƒ Proxy (Middleware)`. **Not opened in a
  browser, and no snapshot has ever been written** — no Blob credential
  is configured here; see *Unit 21* under Completed.
- **Unit 20 — AI sidebar shell
  (`context/feature-specs/20-ai-sidebar-shell.md`) — code complete
  (2026-08-21).** The right-hand placeholder is now a **proper AI
  workspace**, and it is still only a workspace: **no AI, no provider,
  no route, and no streaming** were added. `components/editor/ai-sidebar.tsx`
  keeps every mechanic it had — `EditorShell` still owns `isOpen`, the
  navbar's `Sparkles` toggle still opens it, and the `<aside>` is the
  same `absolute inset-y-0 right-0 z-40 w-80` overlay on `bg-card` with
  its `border-l`, its `translate-x-full`→`translate-x-0` slide, and
  `inert` plus `aria-hidden` while closed, which now matters more
  because the panel contains a text field. It gained a header — a `Bot`
  icon in a `bg-brand-surface` square, **`AI Workspace`**, the muted
  subtitle **`Design your automation solution`**, and the close button —
  and a `Tabs` group of **`AI Architect`** and **`Specs`**, the
  primitive exactly as generated, so the active trigger is the same
  accent treatment the project sidebar's tabs use. The tab contents are
  a new `features/ai-workspace/`: `ai-architect-panel.tsx` (a
  `ScrollArea` conversation over the composer, with an empty state of
  the same bot square, a muted line, and three **disabled**
  starter-prompt chips from `ai-architect-prompts.ts`),
  `ai-chat-composer.tsx` (a `Textarea` auto-sizing between **72px and
  160px** through the primitive's own `field-sizing-content`, `Enter`
  to submit and `Shift+Enter` for a newline, with a send button
  disabled on a blank draft), `ai-chat-message.tsx` (a right-aligned
  `--primary` bubble for a user message and a left-aligned
  `--popover`-with-a-border one **prepared** for an assistant), and
  `ai-specs-panel.tsx` (a disabled `Generate Spec` over one static
  `Solution Architecture Specification` card with a file icon and a
  disabled download). **Submitting appends the message locally and
  nothing else** — no reply is generated, and the conversation lives in
  `hooks/use-ai-architect-chat.ts`, which is mounted at the sidebar
  rather than inside the tab because Radix `Tabs` unmounts the inactive
  panel and would otherwise discard both the messages and a half-typed
  draft. Nothing reaches Liveblocks, Presence, or PostgreSQL, and
  **`isThinking` is still written by nothing**. No token was added — the
  header square reuses `--brand-surface` from the auth panel — no
  primitive was installed or restyled, and **no dependency was
  installed**. The canvas, the room, live cursors, the participant
  group, Templates, Share, the project sidebar, and the `UserButton`
  are untouched; the navbar changed by **one string**, its toggle's
  `aria-label`, so the accessible name matches the panel's new title.
  `npx next typegen`, `npx tsc --noEmit`, `npm run lint`, and
  `npm run build` all pass, reporting the same **eleven** routes plus
  `ƒ Proxy (Middleware)`. **Not opened in a browser** — see *Unit 20*
  under Completed.
- **Unit 19 — Presence avatars and live cursors
  (`context/feature-specs/19-presence-avatars-cursor.md`) — code
  complete (2026-08-21).** A project canvas now shows **who is in it
  and where they are pointing**. A third floating pill, in the canvas'
  **top-right** corner on the same bordered-`--card` surface as the
  component toolbar and the control bar, holds the other people in the
  room, a subtle inset rule, and then the current user — and with
  nobody else connected, the avatars *and* the rule are both absent,
  so an empty divider never appears.
  `features/collaboration/collaborator-avatar-stack.tsx` reads
  **`useOthers`**, so the current user cannot be listed twice, and its
  selector returns **connection IDs only** compared with `shallow`,
  with each avatar then subscribing through `useOther` — presence
  changes as often as a cursor moves, and a plain `useOthers()` would
  re-render the whole stack many times a second. Each collaborator is
  the existing `Avatar` primitive showing their Clerk image with
  **two-letter initials** as the fallback, ringed in that person's own
  cursor colour, **five** faces at most with the remainder as a muted
  `+N` chip. Identity comes from the session's own `other.info` — the
  name, avatar, and colour the auth route already attaches — because
  `useUser` needs a `resolveUsers` callback this application
  deliberately does not have. The current user is the **existing Clerk
  `UserButton`, moved rather than duplicated**: the navbar now renders
  it only when no project is open, which is what satisfies "shown
  once"; Templates, Share, and the AI toggle are untouched, and the
  editor home is unchanged. The group is mounted **outside** the
  connection boundary and the canvas' suspense boundary, so profile
  and sign-out stay reachable while the room connects and if it fails.
  Live cursors are **`@liveblocks/react-flow`'s own `Cursors`**,
  mounted inside `<ReactFlow>` as
  `features/collaboration/collaborator-cursors.tsx` with only the
  `Cursor` appearance supplied — an arrow filled with the
  collaborator's colour, outlined in `--background`, with their name in
  a badge of the same colour. It writes the **existing `cursor`
  presence key** as a partial update, so `isThinking` is untouched and
  **`liveblocks.config.ts` did not change**; the coordinates are React
  Flow's, through `screenToFlowPosition`, converted back with each
  viewer's own pan and zoom; `cursor` clears to `null` on pointer
  leave, blur, and unmount; and only others are ever drawn. Nothing
  about a cursor reaches Storage or PostgreSQL, and zoom, pan,
  viewport, hover, and selection remain client-local. Nodes, edges,
  editing, colours, templates, and Storage are all unchanged, and **no
  dependency was installed** — `@liveblocks/react-flow` was already
  here, and its 95-byte `styles.css` is imported by that one
  component. `npx next typegen`, `npx tsc --noEmit`, `npm run lint`,
  and `npm run build` all pass, reporting the same **eleven** routes
  plus `ƒ Proxy (Middleware)`. **Not opened in a browser**, and
  **never seen with two sessions in one room** — see *Unit 19* under
  Completed, which names what a build cannot cover.
- **Unit 18 — IA starter templates
  (`context/feature-specs/18-starter-template.md`) — code complete
  (2026-08-19).** A canvas can now be **started from a predefined
  high-level IA architecture**. `features/canvas/starter-templates.ts`
  holds three immutable templates — **WorkHQ Agentic Workflow**,
  **Design Studio Queue Processing**, and **Hybrid WorkHQ + Digital
  Worker** — each an id, a name, a description, positioned nodes, and
  edges. A template stores **structure, not appearance**: a component
  type, a position, a colour key, and which sides each connection runs
  between. Every label, shape, size, stroke, and edge style is read
  back from the existing `canvas-components.ts`,
  `canvas-node-tokens.ts`, and `canvas-edge-tokens.ts` through one
  shared `resolveCanvasTemplateNodes()`, so **no component-to-shape or
  component-to-size rule is duplicated** and the preview and the
  import cannot disagree. The four handle names were promoted to a
  shared `CanvasNodeHandleId` in `types/canvas.ts`, so a template
  cannot name a side the node renderer does not declare.
  `canvas-template-import.ts` builds **fresh runtime IDs** — nodes
  through the existing `createCanvasNodeId`, edges through React
  Flow's own `addEdge`, which is the convention `onConnect` already
  produces — and **remaps every edge onto them**, mutating nothing in
  `CANVAS_TEMPLATES`. The picker is `starter-templates-modal.tsx`: the
  existing `EditorDialog` widened to `sm:max-w-3xl`, a scrollable
  `sm:grid-cols-2` grid of `Card`s, each with a name, a description, a
  **lightweight preview**, and an import button.
  `starter-template-preview.tsx` draws a template as **one small
  `<svg>` — no React Flow instance and no Liveblocks** — fitting
  bounds computed from the template's own node positions into a fixed
  box, edges as straight lines between node centres, and shapes
  through the now-exported `CanvasNodeShapePath` and the node colour
  map. Importing **replaces** the canvas rather than adding to it,
  through `onDelete` then `add` changes on `useLiveblocksFlow`'s own
  handlers — `remove` changes are ignored by the integration, so
  `onDelete` is the only thing that deletes from Storage — inside one
  `history.pause()`/`finally { resume() }` block, so **one Undo
  restores the previous architecture**. `initial` is unchanged, the
  room is not remounted, and there is no second copy of canvas state.
  The canvas then fits the imported nodes by ID using the shared
  `canvasFitViewOptions`, once, from a ref-guarded effect that waits
  for the nodes to actually arrive; the resulting viewport is
  client-local. The navbar gained a **Templates** ghost button, scoped
  to an open project like Share; `/editor/[projectId]` stays
  server-side and project fetching did not move. Node rendering, edge
  rendering, the component panel, and node/edge editing are untouched,
  and **no dependency was installed.** `npx next typegen`,
  `npx tsc --noEmit`, `npm run lint`, and `npm run build` all pass,
  reporting the same **eleven** routes plus `ƒ Proxy (Middleware)`.
  **Not opened in a browser** — see *Unit 18* under Completed, which
  names what a build cannot cover.
- **Unit 17 — Canvas ergonomics
  (`context/feature-specs/17-canvas-ergonomics.md`) — code complete
  (2026-08-19).** The canvas can now be **navigated and taken back**.
  A second floating pill at the **bottom-left** holds five icon
  controls in two groups behind a subtle divider — zoom out, fit
  view, zoom in, then undo, redo — as a React Flow `Panel` on the
  same bordered-pill-on-`--card` surface as the component toolbar and
  the colour toolbar. Zooming and fitting are **React Flow's own
  viewport methods** (`zoomIn`, `zoomOut`, `fitView`) with a short
  animation duration, so no transform state is touched here; fit view
  shares the canvas' `maxZoom: 1` floor, now a shared constant, so
  the button lands where the first fit does. Undo and redo are
  **Liveblocks history** — `useUndo`, `useRedo`, `useCanUndo`,
  `useCanRedo` from `@liveblocks/react/suspense`, the entry point the
  label editors already use — so there is **no second history stack
  and React Flow's local state is not used as one**, and the two
  buttons are `disabled` (and dimmed by the `Button` primitive's own
  `disabled:opacity-50`) straight from the room's own answer. New
  `hooks/use-keyboard-shortcuts.ts` binds `+`/`=`, `-`,
  `Cmd/Ctrl + Z`, `Cmd/Ctrl + Shift + Z`, and `Cmd/Ctrl + Y` to the
  **same four actions the buttons call**, passed in rather than
  looked up, so the hook imports neither React Flow nor Liveblocks.
  It listens on `window`, ignores any event whose target is or is
  inside an `input`, `textarea`, `select`, or `contenteditable` —
  which is what preserves unit 14's node label editing and unit 16's
  edge label editing — and calls `preventDefault()` **only on a
  keypress it handles**, leaving `Cmd/Ctrl + =` and `Cmd/Ctrl + -` as
  the browser's page zoom. The **`MiniMap` is gone** and the
  dot-pattern background is untouched. `useLiveblocksFlow`, the four
  handlers, both custom renderers, connection handling, editing,
  drag/drop, and colour behaviour are all unchanged, and **no
  dependency was installed.** `npx next typegen`, `npx tsc --noEmit`,
  `npm run lint`, and `npm run build` all pass, reporting the same
  **eleven** routes plus `ƒ Proxy (Middleware)`. **Not opened in a
  browser** — see *Unit 17* under Completed, which names what a build
  cannot cover.
- **Unit 16 — Edge behavior
  (`context/feature-specs/16-edge-behavior.md`) — code complete
  (2026-08-18).** Components can now be **connected**, and a
  connection can be **labelled in place**. Every node carries **four
  handles** — top, right, bottom, left, under stable side-based IDs —
  and all four are alike: `ConnectionMode.Loose` is unchanged, so no
  side is a source or a target and there is **no semantic connection
  validation**. The old two handles were replaced, not added to, so
  each node has exactly four; they are faint at rest, fade in on
  hover or selection, and **stay mounted when hidden**, because React
  Flow measures a handle to place an edge's endpoint. The **existing
  shared `canvasEdge` type** gained one field, `data.label`, read as
  `""` when absent, so no second edge model exists and an edge stored
  before this unit still reads. New edges get their type, empty
  label, and arrowhead from **React Flow's `defaultEdgeOptions`**, so
  they reach Storage through the **existing Liveblocks `onConnect`**
  with no second creation path. The new `canvasEdge` renderer draws
  `getSmoothStepPath` right-angle routing through `BaseEdge`, dimmed
  at rest and brighter *and* heavier when active, with a wide
  invisible hit band rather than a thicker line. A label is an HTML
  pill at the path's own `labelX`/`labelY` via `EdgeLabelRenderer` —
  never a midpoint computed here — with a faint hint on a selected
  unlabelled edge; double-click opens a growing input that writes
  through `updateEdgeData`, so the room sees the label as it is
  typed, and one session is **one undo step** via Liveblocks
  `pause()`/`resume()` with Unit 14's guard. `nodrag`/`nopan` keep
  label and line interactions off the canvas. `useLiveblocksFlow`
  and all four handlers are untouched, and **no dependency was
  installed.** `npx next typegen`, `npx tsc --noEmit`,
  `npm run lint`, and `npm run build` all pass, reporting the same
  **eleven** routes plus `ƒ Proxy (Middleware)`. **Not opened in a
  browser** — see *Unit 16* under Completed, which names what a build
  cannot cover.
- **Unit 15 — Node colour toolbar
  (`context/feature-specs/15-nodes-color-toolbar.md`) — code
  complete (2026-08-18).** A selected node now carries a **floating
  colour toolbar** above it, and choosing one of five predefined
  themes — `default`, `blue`, `green`, `amber`, `red` — recolours it
  for the whole room. The palette is the **existing**
  `CanvasNodeColor` and `canvasNodeColorTokens` extended, not a
  second colour system: each key resolves through that one map to a
  background, a paired label colour, and a border, and the four new
  hues are **mixed from `--primary`, `--success`, `--warning`, and
  `--destructive`** rather than from new literal values.
  `canvas-node-shape.tsx` needed **no edit at all** — it already read
  colours by key — so Unit 13's brighter selected outline and heavier
  stroke are untouched, as are Unit 14's resizing and label editing.
  **A node stores only the colour key**, never a background, text, or
  border value. The toolbar is React Flow's `NodeToolbar` at the
  `canvas-node.tsx` level, shown on `selected` alone, carrying
  `nodrag nopan nowheel` — load-bearing, because the toolbar portals
  into the element d3-zoom is bound to. A swatch writes only `color`
  through `updateNodeData`, so it is one Liveblocks mutation with
  **no server API call** and no second local copy of node colour, and
  **nothing about toolbar visibility reaches Storage, Presence, or
  Prisma**. **No dependency was installed.** `npx next typegen`,
  `npx tsc --noEmit`, `npm run lint`, and `npm run build` all pass,
  reporting the same **eleven** routes plus `ƒ Proxy (Middleware)`.
  **Not opened in a browser** — see *Unit 15* under Completed, which
  also names the one substitution risk a build cannot cover.
- **Unit 14 — Node editing
  (`context/feature-specs/14-node-editing.md`) — code complete
  (2026-08-14).** A component on the canvas can now be **resized and
  renamed**. A selected node carries React Flow's `NodeResizer` with
  subtle `--ring` handles, stopping at a per-shape minimum from the
  shared token map, and a **circle stays circular** through
  `keepAspectRatio`. Double-clicking the label opens a textarea in the
  label's own centred position, and every keystroke goes straight to
  the node's `data` through `updateNodeData`, so the room sees the
  rename as it is typed. **No second copy of a node's size or label was
  created** — both stay React Flow's, which is Liveblocks Storage's —
  and **no manual history handling was added for resizing**, because
  `@liveblocks/react-flow` already pauses and resumes history around a
  `dimensions` change itself (verified in its shipped source). A label
  session *is* wrapped in one `pause()`/`resume()` pair, including on
  unmount, so one rename is one undo step. Whether the editor is open
  is **local React state** — not Storage, not Presence, not Prisma. The
  Unit 13 four-file structure is intact, no shape geometry changed, and
  **no properties panel, component-specific fields, or edge editing**
  were added. **No dependency was installed.** `npx next typegen`,
  `npx tsc --noEmit`, `npm run lint`, and `npm run build` all pass,
  reporting the same **eleven** routes plus `ƒ Proxy (Middleware)`.
  **Not opened in a browser** — see *Unit 14* under Completed.
- **Unit 13 — Node drag preview and selection polish
  (`context/feature-specs/13-node-drag-preview.md`) — code
  complete (2026-08-14).** Dragging a component out of the toolbar
  now shows a **ghost of the node it will become** attached to the
  cursor, and a selected node is stroked in a brighter colour at a
  heavier weight instead of only a different colour. The existing
  SVG shape renderer was **not replaced** — the drawing was lifted
  into `features/canvas/canvas-node-body.tsx`, which both the
  `canvasNode` renderer and the new preview compose, so the ghost
  and the node that lands are the same drawing. The preview is
  **client-local React state** in
  `hooks/use-canvas-drag-preview.ts`: nothing about it reaches
  Liveblocks Storage or Presence, and the drop path is byte-for-byte
  the one unit 12 built. **No resizing, no label editing, no
  component-specific configuration, and no component-panel rebuild**,
  and **no dependency was installed**. `npx next typegen`,
  `npx tsc --noEmit`, `npm run lint`, and `npm run build` all pass,
  reporting the same **eleven** routes plus `ƒ Proxy (Middleware)`.
  **Not opened in a browser** — see *Unit 13* under Completed.
- **Unit 12 — Shape panel
  (`context/feature-specs/12-shape-panel.md`) — code complete
  (2026-08-13).** The canvas can now be drawn on. A floating pill
  at the bottom-centre holds all **thirteen** IA components in
  three groups — WorkHQ, Design Studio, and shared — and dragging
  one onto the canvas creates a typed node in Liveblocks Storage at
  the drop position. `types/canvas.ts` gained the
  `CanvasComponentType` union and the six-value `CanvasNodeShape`,
  and a new `features/canvas/` module holds the component
  catalogue, the shared token map `ui-context.md` requires, the
  validated drag payload, the node ID generator, and the
  `canvasNode` renderer that draws each mapped shape in SVG with a
  centred label. **No component property editing, no Design Studio
  stages, no Business Object actions, no WorkHQ configuration
  forms, no validation rules, no AI behaviour, and no drill-down
  navigation were added**, and **no dependency was installed**.
  `npx next typegen`, `npx tsc --noEmit`, `npm run lint`, and
  `npm run build` all pass, reporting the same **eleven** routes
  plus `ƒ Proxy (Middleware)`. **Not opened in a browser** — the
  key is set now so nothing blocks it, but no component has
  actually been dragged onto a canvas; see *Unit 12* under
  Completed.
- **Unit 11 — Base canvas
  (`context/feature-specs/11-base-canvas.md`) — code complete
  (2026-08-12).** `/editor/[projectId]` now renders a
  Liveblocks-backed React Flow canvas instead of a placeholder.
  The page stays a Server Component and still resolves access
  before anything renders; `features/collaboration/canvas-room.tsx`
  is the client boundary that joins the room, and
  `features/collaboration/architecture-canvas.tsx` drives React
  Flow entirely from `useLiveblocksFlow`, so nodes, edges, and
  every change handler come from Storage rather than from local
  state. `types/canvas.ts` holds the shared `canvasNode` and
  `canvasEdge` types, and `Storage` in `liveblocks.config.ts` is
  typed from them. **No controls, no custom node or edge
  rendering, no cursor UI, no database or blob canvas
  persistence, no AI behaviour, and no WorkHQ or Blue Prism node
  types were added**, and **no dependency was installed** — every
  package this unit needs was already present.
  `npx next typegen`, `npx tsc --noEmit`, `npm run lint`, and
  `npm run build` all pass, reporting the same **eleven** routes
  plus `ƒ Proxy (Middleware)`. **The canvas had not been opened in
  a browser**, because `LIVEBLOCKS_SECRET_KEY` was absent and no
  room could be joined at all — see *Unit 11* under Completed.
  **The key is set as of 2026-08-13**, so the room can now be
  joined; the browser verification itself is still outstanding and
  is tracked under In Progress rather than here.
- **Unit 10 — Liveblocks setup
  (`context/feature-specs/10-liveblocks-setup.md`) — code
  complete (2026-08-12).** The realtime collaboration
  infrastructure now exists without any realtime UI:
  `liveblocks.config.ts` types `Presence` and `UserMeta`,
  `lib/liveblocks.ts` gained `ensureProjectRoom` and
  `authorizeProjectRoomSession` alongside a distinct
  `LiveblocksNotConfiguredError`,
  `lib/liveblocks-cursor-color.ts` maps a Clerk user ID to a
  colour deterministically, and `POST /api/liveblocks-auth`
  authenticates a browser into one project's room after
  resolving access through the existing helper. **No Liveblocks
  provider, cursor, presence UI, canvas storage, or AI presence
  behaviour was added, and no environment file was created or
  modified** — the secret was unset at the time, which the route
  reports as a `500` configuration error rather than an opaque
  failure. (It has since been set, on 2026-08-13, so that branch
  is no longer the one taken.) `npx tsc --noEmit`, `npm run lint`, and
  `npm run build` all pass, reporting **eleven** routes plus
  `ƒ Proxy (Middleware)`. **38 of 38 automated checks passed**
  against a local stub server — see *Unit 10* under Completed.
- **CodeRabbit review of the uncommitted units 08–09 changes
  addressed (2026-08-12).** The review raised 259 comments, but
  253 were against the vendored Prisma and Clerk skill
  documentation under `.agents/`, `.claude/skills/`, and
  `.windsurf/` — third-party content this project only carries,
  so they were left alone. Six concerned our own code and were
  each checked against the current files before any change:
  - **`.claude/settings.json` auto-approved `Bash(npx prisma *)`
    (critical).** That wildcard covers `migrate reset`,
    `db push --accept-data-loss`, `db execute`, and `db seed` —
    every destructive Prisma command — without a consent
    prompt. Narrowed to six read-only or generate-only
    subcommands. The same review's claim that the lockfile omits
    `prisma` was checked and is **wrong**: it is present at
    7.9.1 as a root dev dependency, so nothing was changed for
    it.
  - **An ambiguous room-create failure could strand a
    Liveblocks room (major).** `POST /api/projects` deleted only
    the project row when `createProjectRoom` threw, but a
    timeout or lost response can mean the room *was* created.
    The compensation now deletes the room before the row, and
    drops the row only once that succeeds — so a failed cleanup
    keeps the ID that names the room instead of orphaning it.
  - **The share dialog could show the previous project's
    collaborators.** `useShareDialog` lives in `EditorShell` and
    survives navigation, and `open()` only reset state on the
    way in, so switching projects with the dialog open left the
    old list and `canManage` under the new project's name.
  - **`EditorDialog`'s `trigger` was typed `ReactNode`** while
    `DialogTrigger asChild` calls `React.Children.only`, so text
    or an array would have thrown at render rather than failed
    to typecheck. Now `ReactElement`. No caller passes `trigger`
    today, so this closes a latent trap rather than a live bug.
  - Two documentation contradictions in this file and one
    obsolete scope note in unit 08's specification, all fixed
    below.
  - Verified: `npx tsc --noEmit`, `npx eslint`, and
    `npm run build` all pass with the same ten routes.
- **Units 01–09 confirmed in Chrome against the real project
  database (2026-08-11).** Every feature specification from 01
  to 09 was driven through the running application in real
  signed-in sessions — including the two paths this file had
  flagged as never browser-verified (unit 09's share dialog and
  the sidebar-link audit fix). **237 checks passed across three
  parts (51 + 57 + 129) and no application defect was found.** This was also the
  first time the configured project database served the
  application; see **Verified End to End**. The remaining
  substitution is Liveblocks, which still has no account key.
- **Unit 09 — Share dialog
  (`context/feature-specs/09-share-dialog.md`) — code
  complete and verified (2026-08-10).** The navbar's share
  button is now live: it opens a dialog that lists a project's
  collaborators enriched with Clerk display names and avatars,
  lets the **owner** invite by email and remove access, shows a
  collaborator a read-only list, and copies the workspace link
  with temporary `Copied!` feedback. Two new API routes back
  it, with ownership enforced server-side on both writes.
  `npx next typegen`, `npx tsc --noEmit`, `npm run lint`, and
  `npm run build` all pass with no errors and no warnings,
  reporting **ten** routes plus `ƒ Proxy (Middleware)`. **39 of
  39 automated checks passed** against a real database and the
  real Clerk test instance — see *Unit 09* under Completed.
- **Unit 08 — Editor workspace shell
  (`context/feature-specs/08-editor-workspace-shell.md`) —
  code complete and verified end to end (2026-08-10).**
  `/editor/[projectId]` is now a full workspace shell: a
  Server Component that resolves access through
  `lib/project-access.ts`, redirects an unauthenticated
  visitor to `/sign-in`, renders `AccessDenied` for a missing
  or unauthorised project, and otherwise renders the canvas
  placeholder inside the navbar, project sidebar, and AI
  panel. `npx tsc --noEmit`, `npm run lint`, and
  `npm run build` all pass with no errors and no warnings,
  reporting the same eight routes plus `ƒ Proxy (Middleware)`.
  **45 of 45 browser checks passed** in a real signed-in
  session — see *Unit 08* under Completed.
- **Units 01–07 re-audited against their specifications
  (2026-08-10).** Every "Check when done" item in specs 01–07
  was checked against the real source, and the schemas,
  services, access checks, and the Liveblocks adapter were
  re-executed — 58 of 59 automated checks passed, the one
  failure being the harness calling a Server-Component-only
  module. `npx prisma generate`, `npx tsc --noEmit`,
  `npm run lint`, and `npm run build` all pass with no errors
  and no warnings, reporting the same eight routes plus
  `ƒ Proxy (Middleware)`. **One real gap was found and
  fixed** — see *Opening a project from the sidebar* below.
- Unit 07 — Wire the editor home
  (`context/feature-specs/07-wire-editor-home.md`) — code
  complete. The sidebar and the three dialogs now run on the
  real project API and Liveblocks; `mock-projects.ts` and
  `project-slug.ts` are deleted.
- **Verified end to end in a signed-in browser session
  (2026-08-06).** Units 01–07 were driven through a real
  Chrome session over CDP against a live database and a live
  Liveblocks adapter: create, rename, and delete each
  completed for real, the sidebar rendered rows from the
  database, and both access-control boundaries answered
  correctly. **No application code needed to change** — the
  only defects found were in the throwaway verification
  harness itself. See **Verified End to End** for what was
  covered and the two substitutions it required.

## Completed

- Unit 01 — Design system and UI primitives:
  - Installed and configured shadcn/ui (CLI 4.16.1,
    `components.json` written, Radix base, Nova preset).
  - Added `components/ui/`: `button`, `card`, `dialog`,
    `input`, `tabs`, `textarea`, `scroll-area`. Generated
    files left unmodified.
  - Installed `lucide-react` (plus `clsx`,
    `tailwind-merge`, `class-variance-authority`,
    `radix-ui`, `tw-animate-css` as CLI dependencies).
  - Added `lib/utils.ts` with the `cn()` helper
    (`twMerge(clsx(...))`).
  - Applied the `ui-context.md` dark palette in
    `app/globals.css` and set the real application
    metadata and `dark` class in `app/layout.tsx`.
  - Verified: `tsc --noEmit`, `npm run lint`, and
    `npm run build` all pass; dev server serves the page
    with no console or server errors; compiled CSS
    contains only dark token values.
  - Updated `ui-context.md` to document the generated
    shadcn defaults: the real radius scale, the supporting
    colour tokens the primitives consume, the installed
    `radix-nova` configuration, and the Radix `asChild`
    composition API.

- Unit 02 — Editor chrome:
  - Added `components/editor/editor-navbar.tsx`: a
    fixed `h-14` bar on `bg-card` with a
    `border-b border-border`, holding three equal flex
    sections. The left one carries the sidebar toggle,
    which swaps `PanelLeftOpen` for `PanelLeftClose` from
    the `isSidebarOpen` prop and exposes `aria-expanded`
    plus a state-dependent `aria-label`. The centre and
    right sections are present but empty.
  - Added `components/editor/project-sidebar.tsx`: an
    `absolute inset-y-0 left-0 z-40` panel that overlays
    the canvas and slides between `-translate-x-full` and
    `translate-x-0`. It takes `isOpen` and `onClose`, and
    contains a `Projects` header with a close button,
    a `Tabs` group with `My Projects` and `Shared` — each
    with a muted empty placeholder inside a `ScrollArea` —
    and a full-width `New Project` button with a `Plus`
    icon pinned below a top border.
  - Added `components/editor/editor-dialog.tsx`: the
    reusable dialog shape wrapping the `Dialog` primitive
    with `title`, optional `description`, optional
    `footer` actions, an optional `asChild` `trigger`, and
    `children` for the body. Colours come from the
    primitive, so they resolve to the `globals.css`
    tokens. No concrete dialog is built yet.
  - Added `components/editor/editor-shell.tsx` to
    compose the navbar and sidebar and own the open
    state. Its canvas region is a `relative` positioning
    context wrapping a `<main>` slot for page content.
  - Applied the chrome through a layout rather than a
    single page: `app/(editor)/layout.tsx` renders
    `EditorShell` around `children`, and
    `app/(editor)/page.tsx` is the placeholder canvas
    content. The former `app/page.tsx` was removed, since
    the route group contributes no URL segment and `/`
    still resolves through the group.
  - Verified: `tsc --noEmit`, `npm run lint`, and
    `npm run build` all pass, and the build still reports
    `/` as a static route. Headless Chrome shows only the
    HMR notices in the console — no errors or hydration
    warnings — the served markup nests
    `header` → `main` → `aside` through the layout, and
    the canvas heading stays at the same position with
    the sidebar open and closed, confirming the overlay
    does not push content.

- Unit 03 — Authentication:
  - Installed `@clerk/ui` (1.27.2) for the themes entry
    point. `@clerk/nextjs` (7.6.4) was already present.
  - Added `lib/clerk-appearance.ts`: Clerk's `dark` theme
    from `@clerk/ui/themes` as the base, with every
    variable overridden to a `var(--token)` reference from
    `app/globals.css` — no literal colours. Passed once to
    `ClerkProvider`, so no page themes Clerk itself.
  - Added `lib/auth-routes.ts`: the single source for the
    public paths, read from
    `NEXT_PUBLIC_CLERK_SIGN_IN_URL` and
    `NEXT_PUBLIC_CLERK_SIGN_UP_URL`, plus `isPublicPath()`
    and the post-sign-in destination.
  - Wrapped the root layout with `ClerkProvider` inside
    `<body>`, as the Next.js SDK requires.
  - Added `proxy.ts` at the project root with
    `clerkMiddleware`, protected-first: `auth.protect()`
    runs for every path `isPublicPath()` rejects, so new
    routes are protected without editing the proxy. The
    matcher skips Next.js internals and static assets and
    re-adds `/(api|trpc)(.*)`.
  - Added the `(auth)` route group, outside `(editor)` so
    the auth pages carry no editor chrome:
    `components/auth/auth-layout.tsx` is the two-panel
    `lg:grid-cols-2` frame, and
    `components/auth/auth-brand-panel.tsx` is the left
    panel — compact logo, tagline, and a four-item
    text-only feature list. Below `lg` the panel is
    dropped with `hidden lg:flex` and only the centred
    form remains.
  - Added the two Clerk pages as optional catch-alls,
    `sign-in/[[...sign-in]]` and `sign-up/[[...sign-up]]`,
    so Clerk can route its own sub-steps (SSO callbacks,
    second factors, email verification) under the same
    path.
  - Moved the editor placeholder from `app/(editor)/page.tsx`
    to `app/(editor)/editor/page.tsx`, so the editor now
    lives at `/editor`, and added `app/page.tsx`, which
    owns no content: it reads `await auth()` and redirects
    to `/editor` or to the sign-in path.
  - Added Clerk's `UserButton` to the navbar right
    section, left with its default menu and profile flows.
  - Added `/.clerk/` to `.gitignore` — Clerk writes an
    unclaimed instance's secret key there in keyless mode.
  - Verified: `tsc --noEmit`, `npm run lint`, and
    `npm run build` all pass, and the build reports
    `ƒ Proxy (Middleware)` plus `/`, `/editor`,
    `/sign-in/[[...sign-in]]`, and
    `/sign-up/[[...sign-up]]`. In headless Chrome, signed
    out, `/editor` and `/` both redirect to `/sign-in` with
    a `redirect_url`, while `/sign-in` and `/sign-up`
    return 200. Signed in, `/` lands on `/editor`, the
    `UserButton` renders inside the navbar's right section,
    and its menu opens with Clerk's default `Manage
    account` and `Sign out`. The Clerk card computes to
    `rgb(17, 17, 19)` (`--card`), inputs to `#18181B`
    (`--secondary`), the submit button to `rgb(59, 130,
    246)` (`--primary`), and type to Geist; no element
    carries an inline hardcoded colour. At 1440px the form
    is centred in the right half with the brand panel
    visible; at 900px and 480px the panel is `display:
    none` and the form is centred, and `scrollHeight`
    equals `innerHeight` at every width, so no auth page
    scrolls. No console errors and no page errors — only
    Clerk's development-keys notice.

- Auth page visual refresh (follow-up to Unit 03, against a
  supplied reference design):
  - Added three derived colour tokens to `app/globals.css`,
    mixed from `--primary` with
    `color-mix(in oklab, …)` rather than given literal
    values: `--brand-panel`, `--brand-panel-border`, and
    `--brand-surface`, exposed in `@theme inline` as
    `bg-brand-panel`, `border-brand-panel-border`, and
    `bg-brand-surface`. The left half now reads as a
    distinctly tinted surface against `--background`
    instead of the barely-distinguishable `--card`.
  - Pinned both grid tracks in
    `components/auth/auth-layout.tsx` to
    `minmax(0, 1fr)`, so content can no longer widen one
    half and the split is exactly 50/50.
  - Rebuilt `components/auth/auth-brand-panel.tsx` as a
    three-part `justify-between` column: wordmark, then a
    `text-4xl` headline plus supporting paragraph and three
    icon feature rows, then a footnote at the bottom. Each
    row pairs a `bg-brand-surface` rounded square holding a
    `text-primary` Lucide icon with a semibold title and a
    muted description.
  - Set `fontSize: "0.875rem"` in
    `lib/clerk-appearance.ts`. Clerk's own base is
    `0.8125rem`, which rendered the card a step smaller
    than the surrounding interface.
  - Verified: the fonts were **already correct** — measured
    with CDP `CSS.getPlatformFontsForNode`, every node
    renders `Geist` (not a fallback), `--font-geist-sans`
    resolves to `"Geist", "Geist Fallback"`, and
    `document.fonts.status` is `loaded`. The gap was
    hierarchy and the panel colour, not the family, so no
    font wiring was changed.
  - Verified: `tsc --noEmit`, `npm run lint`, and
    `npm run build` all pass, with the same five routes and
    `ƒ Proxy (Middleware)`. In headless Chrome at 1440px,
    `aside` and `main` are both exactly 720px wide with the
    panel at x=0 and the form at x=720; the headline
    computes to 36px/600 Geist, feature titles to 14px/600,
    the icon squares to a `--primary`-derived translucent
    fill with `rgb(59, 130, 246)` glyphs, and the Clerk
    input, label, and button all to 14px. At 900px and
    480px the panel is `display: none`.
    `scrollHeight` equals the viewport height at all three
    widths on both `/sign-in` and `/sign-up`, so neither
    page scrolls. No element carries an inline hardcoded
    colour, and there are no console or page errors.

- Unit 04 — Editor home and project dialogs:
  - Added the first `features/` module,
    `features/projects/`: `project-types.ts` (the
    `ProjectSummary` contract and the `ProjectAccess`
    union), `project-slug.ts` (`toProjectSlug()`, which
    lower-cases and collapses every run of
    non-alphanumeric characters to one hyphen), and
    `mock-projects.ts` — three placeholder projects, two
    owned and one collaborator.
  - Added `use-project-dialogs.ts`, the single hook holding
    which dialog is open, the name being typed, the derived
    `slugPreview`, and `isSubmitting`. Its `setDialogOpen`
    matches Radix's `onOpenChange` contract so a dismiss
    clears the form, and `canSubmitName` rejects a
    whitespace-only name. `confirm()` currently only
    manages the loading state and closes — it is where the
    mutation goes once the project API exists.
  - Added `project-dialogs-context.tsx` so the one hook
    instance held by the shell reaches the screens inside
    it. Without it, `app/(editor)/editor/page.tsx` would
    have needed its own copy and the sidebar and the home
    screen would have opened different dialogs.
  - Added the three dialogs on the existing `EditorDialog`
    pattern: `create-project-dialog.tsx` (name input plus a
    live `font-mono` slug preview), `rename-project-dialog.tsx`
    (prefilled and `autoFocus`, current name in the
    description, wrapped in a `<form>` so Enter submits),
    and `delete-project-dialog.tsx` (no input, no body — a
    `variant="destructive"` confirm and the project named in
    the description).
  - Added `project-list-item.tsx`: one sidebar row, with
    rename and delete rendered **only** for
    `access === "owner"`. The actions are absent from the
    DOM for a collaborator rather than hidden, so they
    cannot be tabbed to, and they reveal on
    `group-hover` *and* `group-focus-within` so keyboard
    users can see them.
  - Extended `project-sidebar.tsx` to split the projects by
    access across the two existing tabs and to take
    `onCreateProject`, `onRenameProject`, and
    `onDeleteProject`. It stays presentational — it holds no
    dialog state.
  - Added `features/projects/editor-home.tsx` and reduced
    `app/(editor)/editor/page.tsx` to rendering it. Heading,
    description, and a `Plus` `New Project` button, centred
    and deliberately not in a card.
  - Wired the mobile backdrop scrim in `editor-shell.tsx`:
    `sm:hidden`, so it exists only where the panel covers
    most of the screen. On `sm` and up there is no scrim and
    the canvas stays clickable.
  - Fixed the canvas height chain in `editor-shell.tsx`. The
    canvas region is now `flex` and `<main>` is
    `min-h-0 flex-1` instead of `h-full`. A percentage
    height could not resolve there — the region is itself a
    flex item with an auto height — so `main` collapsed to
    its content and the centred home content sat at the top
    of the canvas rather than in the middle.
  - Verified: `tsc --noEmit`, `npm run lint`, and
    `npm run build` all pass, with the same five routes and
    `ƒ Proxy (Middleware)`. Drove a real signed-in session
    over CDP — 27 checks, all passing: the heading and
    description match the specification exactly, the content
    is not inside a `data-slot="card"`, and after the height
    fix `main` measures the full 749px canvas with the
    heading centred at y=354. Typing `Claims Triage 2!` one
    character at a time produced 13 distinct slug previews
    ending at `claims-triage-2`. Both home and sidebar
    create actions open an empty create dialog; rename opens
    prefilled with `Invoice Intake Automation`, focused, and
    Enter closes it; delete has no input and its confirm
    computes to `rgb(239, 68, 68)`. The Shared tab shows one
    project with zero action buttons, My Projects shows two
    each with both. At 390px the scrim covers the canvas at
    `oklab(0 0 0 / 0.5)` and tapping at x=318 — outside the
    288px panel — closes the sidebar; at 1440px no scrim is
    present. No console errors and no failed application
    requests.
  - Followed up on an external review pass over the branch.
    Fixed `EditorDialog`, which rendered its optional
    `trigger` as a bare child of `Dialog`: a trigger passed
    that way would not have opened the dialog, because Radix
    needs `DialogTrigger` to wire the click and the
    `aria-controls`/`aria-expanded` pair. It is now wrapped
    in `<DialogTrigger asChild>`. No caller passes `trigger`
    yet — all three project dialogs are controlled through
    the hook — so this was latent rather than a live defect,
    and the fix keeps the prop honest for the first caller
    that uses it.
  - The rest of that review pass concerned the vendored Clerk
    skills under `.agents/skills/`, which are third-party
    files pinned by hash in `skills-lock.json` and are left
    unmodified. Its line-ending findings were false
    positives: `core.autocrlf=true` means the working copy is
    CRLF while the git index is already LF.

- Unit 05 — Prisma data models and client:
  - Added `prisma/models/project.prisma` with `Project`,
    `ProjectCollaborator`, and the `ProjectStatus` enum
    (`DRAFT`, `ARCHIVED`). `Project` carries `ownerId` (the
    Clerk user ID — there is no local user table to relate
    to), `name`, optional `description`, `status` defaulting
    to `DRAFT`, the nullable `canvasJsonPath` for the future
    architecture canvas blob, and `createdAt` / `updatedAt`,
    indexed on `ownerId` and `createdAt`.
    `ProjectCollaborator` relates to `Project` with
    `onDelete: Cascade`, identifies the invitee by `email`
    rather than a user ID (they may have no Clerk account
    yet), and carries `@@unique([projectId, email])` plus
    indexes on `email` and `[projectId, createdAt]`. No
    source document, requirement, architecture, standards,
    or build-pack models were added.
  - Added `lib/prisma.ts`. It branches on `DATABASE_URL`:
    a `prisma+postgres://` prefix is a Prisma Postgres
    Accelerate endpoint, which a driver adapter cannot open,
    so the client is built with `accelerateUrl`; every other
    URL is a real Postgres server and goes through
    `new PrismaPg({ connectionString })`. The instance is
    cached on `globalThis` outside production so a hot
    reload reuses one connection pool.
  - Added `prisma/migrations/20260805154737_add_project_and_collaborator/`
    and `prisma/migrations/migration_lock.toml`. The SQL was
    generated by `prisma migrate diff`, not hand-written.
  - Verified: `tsc --noEmit`, `npm run lint`, and
    `npm run build` all pass, with the same five routes and
    `ƒ Proxy (Middleware)`. The migration was applied for
    real against a throwaway local Prisma Postgres server
    (`prisma dev`), since the project database is
    unreachable: `migrate deploy` applied it,
    `migrate status` then reported "Database schema is up to
    date", and `migrate diff` against the live database
    returned "This is an empty migration", so the migration
    reproduces the schema with zero drift. Queried
    `pg_indexes`, `pg_constraint`, and `pg_enum` directly —
    all six expected indexes exist, the foreign key reports
    `confdeltype = 'c'` (cascade), and the enum is
    `DRAFT,ARCHIVED`. Then drove `lib/prisma.ts` itself
    against that database: a created project defaulted to
    `DRAFT` with null `description` and `canvasJsonPath` and
    a UUID id, a duplicate `[projectId, email]` was rejected
    with `P2002` while the same email on a *different*
    project was accepted, deleting a project left zero
    collaborator rows, and `updatedAt` advanced on update.
    The throwaway server was stopped and removed and the
    verification scripts deleted afterwards.
  - Verified both `DATABASE_URL` branches, since only one
    can be exercised by a local Postgres. Probing each with
    a real query: `prisma+postgres://` without an API key
    fails `P6001` "Error validating `accelerateUrl`", while
    `postgres://` fails `P1001` "Can't reach database
    server". Distinct errors, so the prefix genuinely
    selects the branch. Note the client constructs
    **lazily** — an invalid URL does not throw until the
    first query, so constructing one proves nothing on its
    own.

- Unit 06 — Project API routes:
  - Added `app/api/projects/route.ts` (`GET` list, `POST`
    create) and `app/api/projects/[projectId]/route.ts`
    (`PATCH` rename, `DELETE` delete). Both handlers stay
    thin: read the user, validate, check ownership, call a
    service, return a response. `PATCH` and `DELETE` are
    typed with the generated
    `RouteContext<"/api/projects/[projectId]">` helper and
    `await context.params`, which is a promise in this
    version.
  - Added `features/projects/project-schema.ts`. The create
    schema treats a missing, empty, or whitespace-only name
    as `Untitled Project` — applied in a `transform` rather
    than `.default()`, because a default is skipped when the
    key is present but blank. The rename schema deliberately
    **rejects** a blank name instead of defaulting it, since
    a blank rename would silently discard the current name.
    Both trim and cap the name at 120 characters.
  - Added `features/projects/project-service.ts` with
    `listProjectsForOwner`, `createProjectForOwner`,
    `renameProjectForOwner`, and `deleteProjectForOwner`, and
    the `ProjectRecord` response contract. Every query is
    scoped by `ownerId`, and the select list omits `ownerId`
    and `canvasJsonPath` so neither reaches a response. IDs
    come from the schema's `@default(uuid(7))` — nothing is
    generated in application code and there is no sequence.
  - Added `features/projects/project-access.ts` with
    `checkProjectOwnership`, returning `owner`, `forbidden`,
    or `missing`. The three are distinct because they map to
    different status codes; collapsing `missing` into
    `forbidden` would answer `403` for a project that never
    existed.
  - Added `lib/api-response.ts` (the shared `{ error }` body
    and the 400/401/403/404 helpers),
    `lib/api-request.ts` (`readJsonBody`, which turns a
    malformed payload into a `400` instead of a thrown
    exception and treats a wholly absent body as `{}`), and
    `lib/api-auth.ts` (`getRequestUserId`).
  - Installed `zod` (4.4.3) as a direct dependency. It was
    already present transitively through `shadcn` and
    `eslint-config-next`, but `architecture.md` names it as
    the validation layer, so it is now declared.
  - **Excluded `/api` from the proxy's `auth.protect()`** and
    added `isApiPath()` to `lib/auth-routes.ts`. This is a
    real behavioural fix, not a preference: `protect()`
    redirects a *page* request but answers anything else by
    rewriting to a 404, so every unauthenticated API call
    would have returned `404` and the specification's `401`
    would have been unreachable. The routes are not public —
    each one calls `await auth()` itself and owns its status
    code, which invariant 6 requires of them regardless.
  - Verified: `tsc --noEmit`, `npm run lint`, and
    `npm run build` all pass, and the build now reports
    `ƒ /api/projects` and `ƒ /api/projects/[projectId]`
    alongside the previous five routes and
    `ƒ Proxy (Middleware)`. 46 checks, all passing, in two
    layers: the four unauthenticated verbs over real HTTP
    against the dev server (each returns `401` with a JSON
    body, not a 404 rewrite, and the rejected `POST` created
    no row), and the schemas, services, and ownership checks
    driven directly against a throwaway `prisma dev`
    database, since the project database is unreachable.
    Confirmed there: a created project gets a v7 UUID and
    defaults to `DRAFT` with a null description; all four
    blank-name variants store `Untitled Project`; a
    121-character name is rejected and 120 accepted; two
    users' lists are fully disjoint and ordered newest
    first; ownership resolves `owner`/`forbidden`/`missing`
    correctly; a non-owner rename and a non-owner delete
    each touch zero rows and leave the record intact; an
    owner delete cascades the collaborator rows away; and a
    repeat delete reports no row. Also confirmed the proxy
    change did not weaken page protection — signed out,
    `/editor` still lands on `/sign-in?redirect_url=…` — and
    that `/api/projects` returns `401` even when the caller
    forges `Accept: text/html` and `Sec-Fetch-Dest:
    document`, the headers that make `protect()` redirect.
    The dev server log shows only Clerk's development-keys
    notice. The throwaway database and the verification
    script were removed afterwards.

- Unit 07 — Wire the editor home to the API and Liveblocks:
  - Added `hooks/use-project-actions.ts`, replacing
    `features/projects/use-project-dialogs.ts`. It keeps the
    single `{ mode, project }` dialog value and adds the three
    mutations: `submitCreate`, `submitRename`, and
    `submitDelete`. Create navigates with
    `router.push('/editor/' + project.id)` using the **ID from
    the response**, then refreshes; rename refreshes; delete
    reads `useParams()` and `router.replace('/editor')` when
    the deleted project is the open workspace, otherwise
    refreshes. A failure sets an `error` string and leaves the
    dialog open. `setDialogOpen` now ignores a dismiss while a
    call is in flight.
  - Added `features/projects/project-client.ts` — the browser
    calls to the three routes. A failed request is a returned
    value, never a thrown exception, and the error body is read
    defensively because a non-JSON failure has nothing to
    parse.
  - Added `lib/liveblocks.ts` with `createProjectRoom` and
    `deleteProjectRoom`. There is deliberately **no rename**:
    the room ID is the project ID, so a rename cannot affect
    it. A create against an existing room (`409`) and a delete
    of an absent one (`404`) both count as success, so a retry
    cannot fail on its second attempt. The client is built
    lazily, so importing the module never throws during
    `next build`.
  - Wired the rooms into the routes. `POST` writes the project
    row first — its `@default(uuid(7))` ID is what names the
    room — then creates the room, and deletes the row again if
    the room fails, so no response reports a workspace that
    cannot be opened. `DELETE` removes the room **before** the
    row, because once the row is gone nothing records which
    room belonged to it.
  - Added `features/projects/project-lists.ts`
    (`getProjectLists`) and two service functions:
    `listProjectsForCollaborator`, which matches a
    `ProjectCollaborator` row by email, and
    `findAccessibleProject`, the access check behind the
    workspace route. `getProjectLists` reads the session
    itself rather than taking a user ID, so a caller cannot ask
    for somebody else's projects, and it uses `currentUser()`
    rather than `auth()` because a collaborator is identified
    by email and only the full user carries one. The two
    queries run in `Promise.all`.
  - Moved the fetch into `app/(editor)/layout.tsx`, which is
    now `async`. That is the closest server boundary above the
    sidebar — the sidebar is a Client Component — so the
    initial lists arrive with the first render and there is no
    client-side fetch. `router.refresh()` re-runs this layout,
    which is what makes a mutation show up.
  - `EditorShell` now takes `ownedProjects` and
    `sharedProjects` and passes both to `ProjectSidebar`, which
    no longer filters one list by `access`. The two lists come
    from two different queries, so which query returned a row
    *is* its access — there is nothing to filter on.
  - Renamed the context to
    `features/projects/project-actions-context.tsx`
    (`ProjectActionsProvider` /
    `useProjectActionsContext`), for the renamed hook.
  - **Deleted `features/projects/project-slug.ts` and
    `mock-projects.ts`**, and removed `slug` from
    `ProjectSummary`. The specification forbids slugs and
    short unique suffixes, so the slug preview is gone from the
    create dialog: the ID is assigned by the server and there
    is nothing derived from the name left to preview.
  - Added `features/projects/project-summary.ts`
    (`toProjectSummary`) and
    `features/projects/project-dialog-error.tsx` — the
    failure message, as a `role="alert"` live region, because
    it appears after the dialog has already been announced.
  - Added `app/(editor)/editor/[projectId]/page.tsx`, because
    create navigates there and the route had to exist. It is
    deliberately minimal — the project name and a note that the
    canvas comes later — but it carries the real access check:
    the URL's ID is untrusted, so it loads through
    `findAccessibleProject` and answers `notFound()` for both a
    missing project and an inaccessible one, so it cannot be
    used to discover that another user's project exists.
  - Installed `@liveblocks/node` (3.23.1). Verified the API
    against the shipped `.d.ts` rather than from memory:
    `new Liveblocks({ secret })`,
    `createRoom(roomId, { defaultAccesses })`,
    `deleteRoom(roomId)`, and `LiveblocksError.status`.
  - Updated `architecture.md` (a Liveblocks stack row, a
    **Project Workspace Identity** section, and the
    `LIVEBLOCKS_SECRET_KEY` requirement) and
    `project-overview.md`, whose out-of-scope line now
    distinguishes real-time *canvas editing* — still out of
    scope — from the room lifecycle, which is now wired.
  - Verified: `npx tsc --noEmit`, `npm run lint`, and
    `npm run build` all pass with no errors and no warnings.
    The build now reports eight routes — `/editor/[projectId]`
    is new — plus `ƒ Proxy (Middleware)`.
  - Verified `lib/liveblocks.ts` **by executing it**, 17 checks
    all passing. `LIVEBLOCKS_BASE_URL` was pointed at a local
    stub HTTP server, so the real adapter's requests were
    inspected rather than assumed: create is a `POST /v2/rooms`
    whose body's `id` is the project ID **verbatim**, with
    `defaultAccesses: []` and the owner granted `room:write`,
    and **no project name in the body at all** — so nothing can
    be derived from a name. Delete is a
    `DELETE /v2/rooms/<projectId>`. A `409` on create and a
    `404` on delete resolve successfully while a `500` throws in
    both cases, and the module exports exactly
    `createProjectRoom` and `deleteProjectRoom` — there is no
    rename to call.
  - Verified the route ordering and the wiring invariants
    against the real source files, 30 checks all passing: the
    row is written before the room and the room is named from
    `project.id`; a room failure runs an owner-scoped
    `deleteProjectForOwner` and rethrows, so no `201` follows a
    failed room create; `DELETE` checks ownership before
    destroying anything and removes the room before the row;
    `PATCH` references no room and assigns no ID; none of the
    seven wiring modules contains a slug; create pushes
    `/editor/${result.project.id}` and refreshes; delete reads
    `useParams()` and captures `wasActiveWorkspace` *before*
    clearing the dialog; the layout is `async` with no
    `"use client"`; and neither the shell nor the sidebar calls
    `fetch`, so nothing fetches the initial list client-side.
  - Verified over real HTTP against the dev server that the
    proxy change from unit 06 still holds and the new route is
    covered: `/api/projects` (`GET`), `PATCH`, and `DELETE` each
    answer `401` with a JSON body, and as a page request
    `/editor` still lands on
    `/sign-in?redirect_url=…`. The new
    `/editor/[projectId]` is protected the same way. The server
    log holds only Clerk's development-keys notice and a
    slow-filesystem warning — no application errors. A bare
    `curl` to `/editor` reports `404` rather than a redirect,
    which is Clerk's documented `protect()` behaviour for a
    non-page request, not a regression.
  - Both throwaway verification scripts were deleted after the
    run.

- Unit 08 — Editor workspace shell:
  - Added `lib/project-access.ts`, the page-level access
    helper the specification asks for, holding
    `getCurrentIdentity()` (the Clerk `userId` plus the
    nullable primary email) and `resolveProjectAccess()`,
    which answers `unauthenticated`, `denied`, or `granted`
    with the project and how the user reaches it. It composes
    Clerk identity with the existing
    `findAccessibleProject()` query rather than
    reimplementing it, so there is still one place that knows
    a project is reachable by `ownerId` **or** by a
    `ProjectCollaborator` email.
  - **A page's access outcome deliberately has three states,
    not four.** `features/projects/project-access.ts` keeps
    `owner`/`forbidden`/`missing` for the route handlers,
    which must answer `403` and `404` differently, but
    `resolveProjectAccess` collapses a missing project and an
    inaccessible one into one `denied`: distinguishing them in
    the UI would confirm that another user's project exists.
  - Added `components/editor/access-denied.tsx` — a centred
    column with a lock icon in a `bg-muted` square, a short
    message, and an outline button back to `/editor`. It is a
    Server Component; it holds no state.
  - Rewrote `app/(editor)/editor/[projectId]/page.tsx`. It is
    a Server Component that resolves access **before**
    rendering, then only chooses what to show: `redirect()` to
    the sign-in path from `lib/auth-routes.ts` when
    unauthenticated, `AccessDenied` when denied, and
    `CanvasPlaceholder` when granted. It now contains no
    access logic and no Prisma or Clerk import of its own.
    This replaced the previous `notFound()` for an
    inaccessible project — `AccessDenied` keeps the editor
    chrome and gives the user a route back, which a 404 did
    not.
  - Added `components/editor/canvas-placeholder.tsx`, the
    centred placeholder that fills the canvas region on
    `--background`, and
    `components/editor/ai-sidebar.tsx`, the right-hand panel
    for the future AI design assistant. The AI panel mirrors
    the project sidebar's overlay mechanics — an `absolute
    inset-y-0 right-0 z-40` `<aside>` sliding between
    `translate-x-full` and `translate-x-0`, `inert` and
    `aria-hidden` while closed — so opening it never reflows
    the canvas and its controls stay out of the tab order.
    **No AI functionality was added**: it holds a heading, a
    close button, and one line of placeholder copy.
  - Extended `editor-navbar.tsx`. The previously empty centre
    section now shows the open project's name as a truncating
    `text-sm font-semibold` `<h1>`, and the right section
    gained the share button and the AI sidebar toggle ahead of
    Clerk's `UserButton`. Both project actions render **only
    when a project is open**, so the editor home is unchanged.
    The share button is `disabled`, because sharing is out of
    scope for this unit — a visibly unready control rather
    than one wired to a no-op.
  - `editor-shell.tsx` now owns a second piece of open state
    for the AI panel and derives the active project by
    matching `useParams()` against the lists the layout
    already fetched. **No second query for the name** — and
    because a denied project is in neither list, the navbar
    then shows no name and no project actions, so the chrome
    cannot imply access the server refused.
  - The AI panel is mounted **only** with a project open,
    since its toggle lives in the navbar's project actions:
    mounting it unconditionally would let a user leave a
    workspace with the panel open and no control left to close
    it.
  - No new dependency was installed, and no Liveblocks
    provider, React Flow, canvas state, AI call, sharing
    behaviour, upload, or requirements logic was added.
  - Verified: `npx prisma generate`, `npx tsc --noEmit`,
    `npm run lint`, and `npm run build` all pass with no
    errors and no warnings, reporting the same eight routes
    plus `ƒ Proxy (Middleware)` — this unit adds components
    and a helper, not routes.
  - **Verified in a real signed-in Chrome session over CDP —
    45 checks, all passing.** A throwaway harness seeded three
    projects (one owned, one shared with the user by email,
    one belonging to another user) and minted a Clerk sign-in
    ticket. Confirmed: the ticket lands on `/editor`; the home
    navbar shows no project name, no share, and no AI toggle
    while keeping the sidebar toggle; `My Projects` lists the
    owned project linking to `/editor/<id>` with both owner
    actions, and excludes the other user's project; `Shared`
    lists the collaborator project with **zero** action
    buttons. On the owner's workspace the navbar names the
    project, the share button is present and `disabled`, the
    canvas placeholder renders, and `main` measures exactly
    749px — the 805px viewport less the 56px navbar — so the
    canvas fills the remaining space. The sidebar marks the
    open project `aria-current="page"` and, while open, leaves
    `main` at x=0 and 1424px wide, unchanged, so it overlays
    rather than pushes. The AI panel opens to 320px flush with
    the right edge (`right=1424`, viewport 1424) leaving
    `main` at 1424px, reports `aria-expanded="true"`, and on
    close returns `aria-hidden="true"`, `inert`, and
    off-canvas at `left=1424`. A **collaborator** opened the
    shared workspace and the navbar named it. Both another
    user's project and a non-existent one rendered
    `AccessDenied` with a lock icon and a `/editor` link, and
    in both cases the refused project's name appeared
    **nowhere** in the document and the navbar showed no
    project chrome. Scanning all 138 served scripts found no
    Liveblocks and no xyflow/React Flow code, confirming the
    scope boundary. No page exceptions and no application
    console errors.
  - Two substitutions were needed, neither changing what the
    application executed. The project database is still
    unreachable (`P1001`), so the run used the **already
    running** local `prisma dev` server, whose schema was
    already applied — reusing it avoids the TUI problem noted
    below. And because `next dev` recompiles per request and
    wedged under the driver's navigations, the run was driven
    against `next start` on the **production build**, which is
    a stronger check: it is the built output that was
    exercised.
  - The seeded projects and both throwaway Clerk users were
    deleted afterwards — the cascade left zero
    `ProjectCollaborator` rows — and all three harness files
    were removed. No application file was modified for the
    verification.

- Unit 09 — Share dialog:
  - Added `features/collaborators/`, the second `features/`
    module: `collaborator-types.ts` (the `CollaboratorSummary`
    contract and the `CollaboratorListResponse` envelope),
    `collaborator-schema.ts`, `collaborator-service.ts`,
    `collaborator-summary.ts`, `collaborator-client.ts`,
    `collaborator-list-item.tsx`, and
    `share-project-dialog.tsx`.
  - Added `app/api/projects/[projectId]/collaborators/route.ts`
    (`GET` list, `POST` invite) and
    `.../collaborators/[collaboratorId]/route.ts` (`DELETE`).
    Both are typed with the generated `RouteContext<…>` and
    `await context.params`. `GET` resolves access with
    `resolveProjectAccess`, so a **collaborator may read the
    list**, and returns `canManage` alongside it; `POST` and
    `DELETE` use `checkProjectOwnership`, so only the owner
    writes and a non-owner is told `403` while a missing
    project is `404`.
  - **The client is never trusted for `canManage`.** The
    server computes it from the same access check that
    authorised the read, and the dialog enables the invite form
    and the remove buttons from that answer rather than from a
    guess. The API would refuse a non-owner regardless
    (invariant 6) — the flag decides only what is rendered.
  - Added `lib/clerk-identity.ts`, extracting
    `CurrentIdentity` and `getCurrentIdentity()` out of
    `lib/project-access.ts` so the page access check, the
    project lists, and the collaborator routes all read
    identity through one function. It now **lower-cases** the
    primary email.
  - **Email is normalised on both sides, in exactly one place
    each.** `ProjectCollaborator.email` is the collaborator's
    only identity and Postgres comparison is case-sensitive, so
    storing `Bob@Example.com` while Clerk reports
    `bob@example.com` would leave a row that matches nothing —
    the project would never appear in `Shared` — and would let
    `@@unique([projectId, email])` accept the same person
    twice. The invite schema lower-cases on write and
    `getCurrentIdentity()` lower-cases on read.
  - Changed `features/projects/project-lists.ts` to call
    `getCurrentIdentity()` instead of `currentUser()` directly,
    so the email that matches collaborator rows is normalised
    by that same single function.
  - Added `lib/clerk-users.ts` with `findUserProfilesByEmail`,
    the **only** place Clerk is asked for display data, per the
    provider-isolation rule. It batches the whole list into one
    call per 100 addresses, which is Clerk's filter limit.
  - **The profile map is keyed by each returned user's own
    addresses, not the requested ones.** Clerk documents the
    `emailAddress` filter as a case-insensitive **partial**
    match, so it can return users the caller never asked about;
    keying on what came back means a lookup can only ever hit
    an exact match.
  - **A Clerk failure degrades to email-only rather than
    hiding who has access.** The lookup catches and returns an
    empty map, so an enrichment outage renders the list from
    this application's own database using the same fallback an
    unregistered invitee already takes.
  - `collaborator-service.ts` scopes every write by owner.
    Invite reaches the project through a nested
    `project: { connect: { id, ownerId } }`, so the row cannot
    attach to another user's project even if ownership changed
    after the check; removal puts the collaborator ID, the
    project ID, **and** the owner in one `where`, so a
    collaborator ID belonging to another project cannot be
    deleted through this route. A duplicate invite is decided
    by the unique constraint rather than a prior read, so two
    simultaneous invites cannot both insert.
  - Added an **owner self-invite guard**: inviting your own
    primary address answers `409`, since a row for the owner
    would put the project in both `My Projects` and `Shared`.
  - Added `hooks/use-share-dialog.ts`, which owns all dialog
    state and fetches the list when the dialog opens rather
    than with the page, because the navbar renders on every
    editor screen and most visits never open it. An invite
    appends the **server's** returned row, so the removal ID
    and the Clerk data are the server's; a removal drops a row
    only after the server confirms it, so a failure cannot show
    access that still exists.
  - Added `conflictResponse` (409) to `lib/api-response.ts`.
  - Added `components/ui/avatar.tsx` via
    `npx shadcn@latest add avatar` (CLI 4.16.2). Verified it
    wrote only that file and left `app/globals.css`
    byte-identical to a pre-run backup, so the dark palette was
    not overwritten.
  - `editor-navbar.tsx`: the share button is no longer
    `disabled` and now takes `onShareProject`. It opens for a
    collaborator too — the **server's** answer decides what
    they may do, so the button does not have to predict it.
  - `editor-shell.tsx` mounts the dialog keyed to the
    **resolved** project rather than the route's raw ID, so it
    can only load collaborators for a project the server
    already returned in one of the lists.
  - Remove buttons are **absent from the DOM** for a
    collaborator rather than disabled, matching the sidebar
    rows, and each carries an `aria-label` naming who it
    removes.
  - **Deviation from the specification, flagged
    deliberately:** the spec lists copying the project link
    under **Owners**, but the Copy link button renders for a
    collaborator as well. A link grants nothing on its own —
    `/editor/[projectId]` runs its own access check and only an
    invite grants access — and a collaborator who is already in
    the workspace can read the URL from the address bar. Say so
    rather than leave it silent: **revert it to owner-only if
    the literal reading is wanted.**
  - Verified: `npx next typegen`, `npx tsc --noEmit`,
    `npm run lint`, and `npm run build` all pass with no errors
    and no warnings. The build reports **ten** routes plus
    `ƒ Proxy (Middleware)` — `ƒ /api/projects/[projectId]/collaborators`
    and `ƒ /api/projects/[projectId]/collaborators/[collaboratorId]`
    are new.
  - **Verified the service and schema by executing them
    against a real database — 33 checks, all passing.** A
    throwaway harness drove the real modules against the local
    `prisma dev` server and asserted with `pg` directly.
    Confirmed: a mixed-case padded address is trimmed and
    lower-cased; six malformed addresses, a missing key, and a
    255-character address are all rejected while 254 is
    accepted; an owner invite writes exactly one row; a repeat
    is `duplicate` and writes no second row; **a non-owner
    invite is `missing` and writes no row at all**; inviting to
    a nonexistent project is `missing`; the same address on a
    *different* project is accepted; the list is oldest-first,
    scoped to its project, and exposes only `id` and `email`;
    **a non-owner removal removes nothing**; **a valid
    collaborator ID from another project cannot be removed
    through this project**, and that other project's row
    survived; an owner removal removes exactly the addressed
    row; a repeat removal reports none; and deleting the
    project cascades the collaborator rows away.
  - **Verified Clerk enrichment against the real Clerk test
    instance — 6 checks, all passing.** An empty request makes
    no call; an unregistered address resolves to nothing, which
    is the email-only fallback; a real user's address resolved
    to a profile carrying an `imageUrl`, with `displayName`
    either absent or non-empty but never blank; and an
    UPPERCASE address still resolves, confirming the map's
    normalised keys. The harness was **read-only** — it created
    and deleted no Clerk user — and printed no address, name,
    or image URL, only whether each lookup resolved.
  - **Verified the HTTP boundary against the dev server.** All
    three verbs — `GET` and `POST` on the collection and
    `DELETE` on an item — answer `401` with a JSON body when
    unauthenticated, including for malformed JSON, so the
    rejection happens before any body parse or database call.
    A `GET` on the item route is `405`, so `DELETE` is the only
    verb it exposes.
  - **Now verified in a browser (2026-08-11).** Superseded — see
    **Verified End to End**. The invite-then-see-the-row-appear
    path, the Clerk name and avatar, the email-only fallback,
    the removal disappearing, the collaborator's read-only view,
    and the `Copied!` label reverting after ~2s were all driven
    through two real signed-in Chrome sessions against the real
    database.
  - Both harnesses were deleted after the run, the seeded rows
    were removed (the cascade left none behind), the
    verification dev server was stopped and its port released,
    and **no application file was modified for the
    verification.**

- Unit 10 — Liveblocks setup (2026-08-12):
  - `liveblocks.config.ts` at the project root is the **single
    source of truth for the realtime type contract**, declaring
    the global `Liveblocks` interface: `Presence` carries
    `cursor: {x, y} | null` and `isThinking: boolean`, and
    `UserMeta` carries `id` plus an `info` of `name`,
    `avatar?`, and `color`. `Storage` is deliberately an empty
    `Record<string, never>` — the canvas is a later unit and
    typing storage now would invent behaviour.
  - `avatar` is `string | undefined`, **not nullable**.
    Liveblocks' own `IUserInfo` constraint is
    `{[key: string]: Json | undefined; name?: string; avatar?: string}`,
    so a `null` is rejected outright. The route therefore
    spreads the key conditionally
    (`...(profile.imageUrl ? { avatar: profile.imageUrl } : {})`)
    rather than passing `null` through.
  - The config also exports
    `export type ProjectUserInfo = Liveblocks["UserMeta"]["info"]`.
    This exists for a concrete reason: any module that imports
    the `Liveblocks` **class** from `@liveblocks/node` — the
    server adapter does — shadows the global interface and
    cannot write `Liveblocks["UserMeta"]["info"]` at all. One
    named alias keeps the definition in one place instead of
    letting the shape drift between the config and the adapter.
  - `lib/liveblocks-cursor-color.ts` maps a Clerk user ID to
    one of eight literal hex colours, deterministically, so
    the same person is the same colour in every session and on
    every collaborator's screen without any coordination.
    Hashing is **FNV-1a** (`Math.imul`), not a char-code sum:
    Clerk IDs all share the long `user_` prefix and a sum
    clusters them into a few buckets.
  - The palette is **literal hex, and that is a deliberate
    exception** to the no-hardcoded-colours rule — recorded in
    `ui-context.md`. A cursor colour is **data** that travels
    over the wire to other clients, not styling applied to this
    document, so `var(--token)` would arrive as an unresolvable
    string. The values avoid `--primary`, `--success`,
    `--warning`, and `--destructive` so a cursor is never
    mistaken for interface state.
  - `lib/liveblocks.ts` gained `LiveblocksNotConfiguredError`,
    a named error class replacing the bare `Error` the client
    getter used to throw, plus two operations:
    `ensureProjectRoom(projectId)` and
    `authorizeProjectRoomSession(projectId, userId, userInfo)`.
    The existing `createProjectRoom` and `deleteProjectRoom`
    are untouched and **still no rename operation exists** —
    renaming a project must not change its room ID, and the
    surest way to guarantee that is to have no way to do it.
  - `ensureProjectRoom` calls `getOrCreateRoom(projectId, {defaultAccesses: []})`.
    Empty `defaultAccesses` makes the room **private with no
    default public access**; the idempotent form heals a
    project whose room is missing (created before the secret
    was configured, or deleted out of band) without a
    create-then-catch-409 dance.
  - **Design decision — room permissions live on the session,
    never on the room.** No `usersAccesses` or `groupsAccesses`
    is ever baked into a room. Access is resolved from the
    database on every authorization, so a removed collaborator
    cannot keep a permission the database no longer supports.
    This resolves the **Next Up** item that had left open where
    a collaborator's room grant belongs: it belongs in the auth
    endpoint, per session, and the invite route needs no
    Liveblocks call at all.
  - The grant is `session.allow(projectId, ["*:write"])` — the
    project ID **exactly**, with no trailing `*` and no prefix.
    A pattern grant would hand the holder every other IA
    Solution Design project. **Never widen this.**
  - `app/api/liveblocks-auth/route.ts` is the new
    `POST /api/liveblocks-auth`. In order: Clerk user ID or
    `401`; JSON body or `400`; schema parse or `400`;
    `resolveProjectAccess(projectId)` giving `401` when
    unauthenticated and **`403` when denied**; the current
    user's profile or `401`; then `ensureProjectRoom` followed
    by `authorizeProjectRoomSession`, returning Liveblocks' own
    status and body verbatim.
  - It answers **`403`, not `404`,** for a project the caller
    cannot reach — a deliberate divergence from the pages,
    which collapse the two into `notFound()`. The spec asks for
    `403` here, and a `404` would leak which project IDs are
    real to a caller enumerating them. Pages hide existence
    because a human typed the URL; this endpoint is called by
    our own client with an ID it already holds.
  - `features/collaboration/liveblocks-auth-schema.ts` is the
    first file in a new `features/collaboration/` module. It
    trims the `room` field and rejects empty, whitespace-only,
    and over-64-character values, so a malformed room never
    reaches an access check or Liveblocks.
  - `lib/api-response.ts` gained `configurationErrorResponse`,
    a `500`. A missing server secret is **not** the caller's
    fault and there is nothing they can correct, so it must not
    masquerade as a `4xx`. The route catches only
    `LiveblocksNotConfiguredError` and rethrows anything else.
  - `lib/clerk-users.ts` gained `getCurrentUserProfile()`,
    keeping this the only module that asks Clerk who someone
    is. `displayName` is **non-nullable** — a cursor with no
    label is unusable — resolved through
    `fullName → username → email local part → "User <last 6 of ID>"`.
    `imageUrl` uses `||`, not `??`, because Clerk returns `""`
    rather than `null` for an absent image. Identity is read
    **server-side only**; a client cannot name or colour itself.
  - **Out of scope and confirmed absent:** no Liveblocks room
    provider in the workspace, no realtime cursors, no presence
    UI, no React Flow canvas storage, no collaborative
    node/edge state, no AI presence behaviour, no comments, no
    notifications. Only the already-installed Liveblocks
    packages are used and **no dependency was added**.
  - **No environment file was created or modified.**
    `LIVEBLOCKS_SECRET_KEY` was unset in both `.env` and
    `.env.local` when this unit was built, no placeholder was
    substituted, and nothing was hard-coded. (**The key was set
    outside this unit, on 2026-08-13** — see In Progress.)
    Startup and `npm run build` are unaffected
    by its absence — the failure surfaces only when the
    functionality is actually invoked, as a
    `LiveblocksNotConfiguredError` that names the variable and
    a `500` reading "Realtime collaboration is not configured
    on this server."
  - Verified: `npx prisma generate`, `npx next typegen`,
    `npx tsc --noEmit`, `npm run lint`, and `npm run build` all
    pass with no errors and no warnings. The build reports
    **eleven** routes plus `ƒ Proxy (Middleware)` —
    `ƒ /api/liveblocks-auth` is new.
  - **Verified the adapter, the colour helper, and the schema
    by executing them — 38 checks, all passing.** A throwaway
    harness drove the real modules against a local `node:http`
    stub server via `LIVEBLOCKS_BASE_URL`, inspecting the
    actual outgoing requests rather than trusting the call
    sites. Confirmed: colour is stable per ID, all eight
    palette values are reached with a non-clustered
    distribution, and none collides with an interface token;
    the module still exports no rename;
    `ensureProjectRoom` sends **exactly one** idempotent
    `POST /v2/rooms` whose body `id` is the project ID verbatim
    with `defaultAccesses: []` and **no `usersAccesses`,
    `groupsAccesses`, or `metadata`**;
    `authorizeProjectRoomSession` sends **exactly one**
    `POST /v2/authorize-user` identified by the Clerk user ID
    granting **exactly one room — the project ID, no wildcard
    and no prefix — at `*:write`**, with name, avatar, and
    colour attached; **the project name appears nowhere in
    either body**, so no document title crosses the wire;
    Liveblocks' status and body are returned unaltered; an
    absent avatar is an omitted key rather than a `null`; a
    `500` from Liveblocks throws; and with the secret unset
    both functions throw `LiveblocksNotConfiguredError` naming
    the variable while **no request reaches Liveblocks at
    all**. The schema trims and rejects missing, empty,
    whitespace-only, and 65-character rooms. `liveblocks.config.ts`
    is type-only at runtime.
  - **Stated plainly: no Liveblocks account key existed when
    this unit was built, so the room-create and
    session-authorize paths have been proven only against a
    local stub, never against Liveblocks' own servers.** What is
    verified is what *we* send and how we handle what comes back.
    Whether Liveblocks accepts these requests, and whether a
    browser can actually join the room with the returned token,
    is **still unverified** — a real key exists as of 2026-08-13,
    so it is now verifiable, but nobody has run it. Neither this
    unit nor any later one has been driven through a browser
    against real Liveblocks.
  - The auth route's own HTTP boundary is likewise
    **unverified against a running server** — the established
    pattern for a new route (`401` unauthenticated, `400`
    malformed) has not been run here, because the interesting
    branches past the auth check all terminate in the missing
    secret.
  - The harness was deleted after the run and **no application
    file was modified for the verification.**
  - Updated `context/architecture.md` (a new **Realtime
    collaboration** subsection, plus the config in System
    Boundaries and `configurationErrorResponse` in the
    route-handler conventions) and `context/ui-context.md`
    (a new **Collaborator cursor colours** subsection recording
    the palette exception).

- Unit 11 — Base canvas:
  - Added `types/canvas.ts`: `CanvasNodeShape`
    (`rectangle`/`rounded`/`diamond`), `CanvasNodeData`
    (a required `label`, optional `color` and `shape`),
    `CanvasEdgeData`, and the two custom types
    `CanvasNode = Node<CanvasNodeData, "canvasNode">` and
    `CanvasEdge = Edge<CanvasEdgeData, "canvasEdge">`. It sits at
    the root rather than in a feature module because
    `liveblocks.config.ts` reads it too.
  - **`CanvasNodeData` is a `type` alias, not an `interface`**,
    which is a deliberate exception to `code-standards.md`. React
    Flow constrains node data to `Record<string, unknown>`; an
    alias of an object literal gets an implicit index signature
    and satisfies that, while an interface gets none and does
    not.
  - **The types are deliberately thin and `shape` is read by
    nothing yet.** Custom node rendering is out of scope, and the
    real component categories are a later feature — inventing
    WorkHQ or Blue Prism node kinds here would breach invariant
    7. `color` names a shared token rather than holding a literal
    colour, so the palette stays in one map when they arrive.
  - Typed `Storage` in `liveblocks.config.ts` as
    `{ flow?: LiveblocksFlow<CanvasNode, CanvasEdge> }`,
    replacing the `Record<string, never>` the previous unit left.
    The shape is described **from the shipped
    `@liveblocks/react-flow` types** rather than hand-modelled,
    so it matches what `useLiveblocksFlow` actually writes under
    its default `"flow"` key: one `LiveObject` holding two
    `LiveMap`s.
  - **The `flow` key is optional, and that is load-bearing.**
    `RoomProviderProps` runs `Storage` through `PartialUnless`,
    so a required key would make `initialStorage` a **required**
    prop — a second initialiser competing with the hook's own.
    An optional key is still a valid `LsonObject`, keeps
    `initialStorage` optional, and matches reality: a room nobody
    has opened has no `flow` until the hook creates it.
  - Added `features/collaboration/canvas-room.tsx`, the client
    boundary: `LiveblocksProvider authEndpoint="/api/liveblocks-auth"`,
    `RoomProvider id={projectId}` with
    `initialPresence={{ cursor: null, isThinking: false }}`, and a
    `ClientSideSuspense` around the canvas. `authEndpoint` rather
    than `publicApiKey`, since a room is joinable only by an
    owner or a collaborator and that needs a server-side check.
  - **`isThinking: false` is in the initial presence although the
    specification names only `cursor: null`.** `Presence` types
    it as a required `boolean`, so omitting it would not compile;
    `false` is also the truthful value at the moment a room is
    joined.
  - **No `initialStorage` on `RoomProvider`.** The hook
    initialises the `flow` tree itself, inside a disabled history
    step, and only when the key is absent — so `initial: []` is
    the state of a project nobody has drawn in, never an
    overwrite of an existing canvas.
  - Added a `CanvasConnectionBoundary` inside the provider that
    swaps the canvas for an error screen on a
    `ROOM_CONNECTION_ERROR` from `useErrorListener`.
    **A React error boundary would not have caught this**, which
    is why `react-error-boundary` was not installed despite the
    Liveblocks references recommending it: the failure happens in
    the client's connection state machine, not during render.
    Read from the shipped source — a `StopRetrying` from the auth
    request fires `fireErrorEvent(message, -1)`, the room turns
    that into a `LiveblocksError`, and **when nothing is
    subscribed it is only `console.error`d in development**.
    Meanwhile `waitUntilStorageReady` loops until Storage loads,
    so without the listener a refused room would sit on the
    loading state forever with the reason invisible.
  - **Only `ROOM_CONNECTION_ERROR` is treated as fatal.**
    Liveblocks retries a transient failure itself and emits
    nothing while backing off, so an error that arrives has
    already exhausted its retries. Other error kinds are left
    alone rather than swallowed — they belong to features this
    unit does not have.
  - Added `features/collaboration/canvas-connection-states.tsx`
    with the two non-canvas states of the region: a spinner and
    "Connecting to the canvas…", and a `role="alert"` line asking
    for a reload. **The loading state is a spinner, not a
    skeleton** — a skeleton of an empty canvas is a grid of dots,
    which would read as a loaded canvas. The error names no cause
    and offers no retry: a refused token, a revoked access, and a
    missing secret are indistinguishable to the browser, and none
    is fixed by trying again.
  - Added `features/collaboration/architecture-canvas.tsx`:
    `useLiveblocksFlow<CanvasNode, CanvasEdge>` with
    `suspense: true` and empty `initial` arrays, feeding `nodes`,
    `edges`, `onNodesChange`, `onEdgesChange`, `onConnect`, and
    `onDelete` into `ReactFlow`, plus
    `connectionMode={ConnectionMode.Loose}`, `fitView`,
    `colorMode="dark"`, a `MiniMap`, and a dots `Background`.
  - **`suspense: true` removes the loading branch entirely.** The
    hook's suspense overload returns `nodes` and `edges` as
    non-null arrays and `isLoading: false`, so the component has
    no empty-state fork — `ClientSideSuspense` above it owns
    that.
  - **`onDelete` is passed as well as the change handlers**, so
    removing a component takes its connections out of Storage in
    the same mutation instead of leaving edges pointing at
    nothing.
  - **Loose connections** because an architecture diagram is
    drawn by dragging between components, and strict mode refuses
    a source-to-source drag — which to the person drawing it is
    the same connection in the other direction.
  - Imported **`@xyflow/react/dist/base.css` only**. Read from
    the shipped stylesheets: `base.css` already carries the
    MiniMap rules, the background-pattern rules, and the
    `.react-flow.dark` block that redefines the `--xy-*`
    defaults, while `style.css` adds default-node chrome and
    controls styling this unit does not render. `colorMode="dark"`
    is what puts that class on the root.
  - **The canvas fills the region through its parent, not
    itself.** React Flow applies
    `width: 100%; height: 100%` to its own wrapper *after* the
    caller's `style`, so a caller cannot size it — the wrapper
    here is `h-full w-full` inside the existing `min-h-0 flex-1`
    region, which is the one place a percentage height resolves.
  - **No literal colours.** The MiniMap and the dot pattern take
    `var(--token)` references, which React Flow forwards into its
    own `--xy-*-props` variables; the mask is
    `color-mix(… 60%, transparent)`, matching React Flow's own
    default alpha, since an opaque mask would hide the off-screen
    components the MiniMap exists to show.
  - `app/(editor)/editor/[projectId]/page.tsx` now returns
    `<CanvasRoom projectId={access.project.id} />`. It is still a
    Server Component with the same three-outcome access check,
    and the room ID comes from the **project the server
    resolved** rather than from the raw route parameter.
  - Deleted `components/editor/canvas-placeholder.tsx`. Its only
    two references were that import and that return, so it was
    removed rather than left as dead code — the specification
    asks for it to be replaced.
  - No new dependency: `@liveblocks/react`,
    `@liveblocks/react-flow`, and `@xyflow/react` were all
    already in `package.json`. `@liveblocks/react-flow/styles.css`
    and `@liveblocks/react-ui/styles.css` are **not** imported —
    they exist for the `Cursors` component, and cursor UI is out
    of scope.
  - **The official Liveblocks React Flow docs page is stale on
    one point and was not followed.** It shows `Storage` as
    `{ nodes: LiveList<LiveObject<Node>>; edges: … }` alongside
    `createRoomContext`, which does not match shipped 3.23.1. The
    types here come from the installed `.d.ts` and `.js`, which
    is this project's established practice for a library ahead of
    its documentation.
  - Verified: `npx prisma generate`, `npx next typegen`,
    `npx tsc --noEmit`, `npm run lint`, and `npm run build` all
    pass with no errors and no warnings, reporting the same
    **eleven** routes plus `ƒ Proxy (Middleware)` — this unit adds
    components and types, not routes. A clean `tsc` is also what
    confirms both typing decisions: the optional `flow` key keeps
    `initialStorage` optional, and the suspense overload narrows
    `nodes` and `edges` to arrays.
  - **Not verified in a browser.** When this unit was built
    `LIVEBLOCKS_SECRET_KEY` was absent from both `.env` and
    `.env.local`, so `POST /api/liveblocks-auth` answered `500`
    and **no room could be joined at all** — the one thing that
    would have run in Chrome was the error state. No placeholder
    key was added to make it look otherwise. **The key was set on
    2026-08-13**, which removes the blocker but changes nothing
    about what has been observed: whether nodes and edges sync
    between two browsers, whether `fitView` behaves on a populated
    canvas, and whether the dark palette and token colours render
    as intended are all still **unverified**.

- Unit 12 — Shape panel (2026-08-13):
  - **Rewrote `types/canvas.ts`.** `CanvasNodeShape` is now the
    six values the specification names —
    `rectangle`/`diamond`/`circle`/`pill`/`cylinder`/`hexagon`.
    **`"rounded"` was removed rather than kept**: nothing read
    `shape` before this unit, so no stored node could carry it, and
    `pill` is the same idea under the name the specification uses.
    Added `CanvasComponentType`, a thirteen-value union, and
    `CanvasNodeColor`; `CanvasNodeData` gained an optional
    `componentType` beside `label`, `color`, and `shape`.
  - `diamond` is in the shape union, sized, and drawn, but has
    **no toolbar component** — the specification retains it for
    future decision and branching components, and a renderer that
    already covers it will not need reopening for them.
  - **The three data fields stay optional, and are read
    defensively.** A node written by an earlier version of the
    application in a tab that is still open is a real case in a
    collaborative document, so the renderer falls back to
    `rectangle` and the default colour rather than rendering
    nothing.
  - **`types/canvas.ts` stayed type-only.** The unions are
    declared there; every value they index lives in the new
    `features/canvas/` module, so nothing in `types/` reaches into
    a feature. `liveblocks.config.ts` needed no edit — `Storage` is
    typed from `CanvasNode`, so the new fields flowed through it.
  - Added `features/canvas/canvas-components.ts`, the catalogue:
    thirteen components in three groups (WorkHQ six, Design Studio
    three, shared four), each with its stored type, display label,
    shape, Lucide icon, and a one-line description. It is the only
    place a component's name, icon, and shape are decided, plus a
    `Map` keyed by type for the drop handler and a derived list of
    types for the payload schema.
  - **A stored `componentType` is an identifier, not display
    text.** The label comes from the catalogue, so renaming a
    component in the interface does not rewrite the nodes already
    in Storage, and the derived type list cannot fall behind the
    catalogue because it is computed from it.
  - **Nothing in the catalogue describes a WorkHQ or Design Studio
    capability (invariant 7).** An entry is a name, a picture, and
    an outline; the descriptions say what a component stands for on
    a diagram, not what either product can do. `Process` and
    `Business Object` are one component each, since each will open
    its own detailed canvas later.
  - Added `features/canvas/canvas-node-tokens.ts`, **the one
    shared token map `ui-context.md` requires.**
    `canvasNodeShapeTokens` gives every shape a default size and a
    label inset; `canvasNodeColorTokens` gives every colour name a
    surface, border, selected border, and label class. Neither the
    toolbar nor the renderer holds a dimension or a colour.
  - **The default size belongs to the shape, not the component**,
    because it is the shape that decides how much room a label
    needs. Rectangles (180×72) and pills (200×64) are wider than
    tall, circles are square (96×96), cylinders are wide enough for
    a label under the rim (168×100), and hexagons are slightly
    larger for readability (184×104) — which is exactly what the
    specification asks for, expressed once rather than thirteen
    times.
  - **There is one colour entry, `default`.** The specification
    says to use "the default node colour", which is narrower than
    the per-category palette `ui-context.md` allows for; rather
    than invent category colours, the map has a single entry every
    component points at, and adding categories later means adding
    entries there and naming them from the catalogue. The values
    are `var(--token)` **strings**, not classes, because they are
    handed to SVG `fill` and `stroke`, which cannot take a class.
  - Added `features/canvas/canvas-drag-payload.ts`: the payload
    (component type, label, shape, default width, default height),
    a Zod schema for it, and read/write/`has` helpers.
  - **The payload is validated even though both ends are this
    application**, because `DataTransfer` carries a string and what
    arrives is genuinely unknown input (`code-standards.md`). It is
    set under the custom MIME type
    `application/x-ia-canvas-component`, so a dragged file, link,
    or text selection cannot be mistaken for a component. Sizes are
    bounded on both sides — a zero or negative node would be
    invisible and unselectable.
  - **A payload that fails validation is a no-op, not an error.**
    Nothing was changed and the user has nothing to correct, so
    there is no message to show.
  - **`dragover` cannot read the payload — only its types.** The
    browser hides the data until the drop, which is why acceptance
    is decided by `hasCanvasComponentDragPayload` checking
    `dataTransfer.types` and the full parse happens in `drop`.
  - Added `features/canvas/canvas-node-id.ts`. An ID is
    `componentType-timestamp-counter-random`. The specification
    names the first three; **the random suffix was added because
    the counter is per browser session**, so two people dropping
    the same component in the same millisecond would otherwise
    agree on every part. The ID is a `LiveMap` key, so a collision
    would overwrite one person's component with another's rather
    than adding a second node.
  - **This is not an exception to the identifier rule in
    `architecture.md`.** That rule governs *records*, which the
    database names. A canvas node is not a row — it exists only in
    the Liveblocks document, which no server writes to.
  - Added `features/canvas/canvas-node-shape.tsx` and
    `features/canvas/canvas-node.tsx`: the SVG outline for all six
    shapes, and the `canvasNode` renderer that composes it with a
    centred, two-line-clamped label and two connection handles.
  - **The shapes are SVG, not CSS.** A hexagon, a cylinder, and a
    diamond have no CSS border, and `clip-path` cuts an outline off
    instead of stroking it, so half the set could not have shown a
    border and the shapes would have needed two mechanisms. Every
    path is inset by half the stroke width, since a stroke
    straddles its path and would otherwise be clipped by the
    viewBox.
  - A pill derives its corner radius from its own half-height, and
    a circle is an `ellipse`, so both stay themselves if a node is
    ever resized. A hexagon's point is capped in absolute units as
    well as taken as a fraction of the width, so a wide component
    does not become an arrowhead. A cylinder is two paths — the
    body, plus the front half of the top ellipse stroked over it,
    which is what reads as a lid rather than a bulge.
  - **The handles are styled here rather than inherited.**
    `base.css` positions a handle but gives it no size or colour —
    those rules are in the `style.css` this project does not
    import — so both come from classes referencing the palette.
  - **`nodeTypes` is a module-scope constant.** An inline literal
    is a new object identity every render, which React Flow warns
    about and which would remount every node.
  - **The renderer falls back to the shape's default size for its
    geometry**, because React Flow passes the *measured* width and
    height and a node's first render happens before it has been
    measured.
  - Added `features/canvas/canvas-component-toolbar.tsx`: a
    React Flow `Panel position="bottom-center"` holding a
    `rounded-full` `bg-card/95` bar of the three groups, each behind
    a visible `text-xs` heading with a divider between groups.
    Positioning comes from `base.css`, which already carries
    `.react-flow__panel.bottom.center`, so no hand-written overlay
    was needed.
  - `nopan nowheel` on the panel, so a drag or a scroll that starts
    on the toolbar does not pan or zoom the canvas underneath it.
  - Each component is a `<button draggable>`, so it is in the tab
    order and reads as a control, with the description on `title`
    for a hover hint — `ui-context.md` asks for tooltips on
    unfamiliar icons and **no `Tooltip` primitive is installed**, so
    the native one carries it rather than adding a primitive this
    unit was not asked for.
  - **A component button has no click behaviour**, because a click
    has no cursor position to create a node at. It is left as a
    labelled drag source rather than wired to a no-op, matching the
    navbar convention for an action that is not ready.
  - Rewrote `features/collaboration/architecture-canvas.tsx`. It
    now splits in two: `ArchitectureCanvas` holds the sizing wrapper
    and a `ReactFlowProvider`, and `CollaborativeFlow` inside it
    holds the hook, the drop handlers, and `<ReactFlow>`.
  - **The provider had to move above `<ReactFlow>`**, because
    `screenToFlowPosition` reads React Flow's store and a hook
    cannot read a store created by a component below it. Read from
    the shipped source: `<ReactFlow>`'s internal `Wrapper` returns a
    fragment when it finds an existing `StoreContext`, so there is
    still exactly one store.
  - `onDragOver` calls `preventDefault` on **every** event, not
    once — the browser's default is to refuse the drop, so without
    it `drop` never fires — and only for our own MIME type, so a
    file dragged over the canvas still shows the browser's "no".
  - `onDrop` converts the pointer with `screenToFlowPosition`, then
    **offsets by half the node**, so a component lands centred under
    the cursor rather than with its corner there.
  - **A dropped node is added with
    `onNodesChange([{ type: "add", item: node }])`.** Confirmed from
    the shipped `@liveblocks/react-flow` source that its
    `applyNodeChanges` answers an `add` by writing
    `nodes.set(id, toLiveblocksInternalNode(...))` into Storage —
    so this is the supported path and there is still no second copy
    of the diagram (`architecture.md`: "Do not add one").
  - Added `fitViewOptions={{ maxZoom: 1 }}`, a floor `fitView`
    otherwise lacks: fitting a single node fills the viewport with
    it, so the first component anyone dropped would jump to an
    enormous zoom.
  - Moved the MiniMap to `position="top-right"`. Its default
    bottom-right is where the toolbar's right-hand end reaches in a
    narrower window.
  - **Deleted no file and installed no dependency.** `lucide-react`
    supplies all thirteen icons (verified against the package's own
    barrel `.d.ts`), `zod` was already a direct dependency, and
    React Flow's `Panel`, `Handle`, and `useReactFlow` are all part
    of `@xyflow/react`.
  - **Out of scope and confirmed absent:** no component property
    editing, no Design Studio stages (Start, End, Action, Page,
    Decision, Choice, Read, Write, Navigate, Exception), no Business
    Object actions, no WorkHQ configuration forms, no component
    validation rules, no AI behaviour, and no drill-down
    navigation. The renderer draws a shape, a border, and a label —
    nothing else.
  - **A stale `.next/dev/types/routes.d.ts` was deleted, and it was
    not this unit's code that it broke.** `tsconfig.json` includes
    both `.next/types` and `.next/dev/types`, and the second was
    left by an older `next dev` run listing routes from before
    `DELETE …/collaborators/[collaboratorId]` existed. Its
    `AppRouteHandlerRoutes` shadowed the freshly generated one, so
    `tsc` reported three errors in that route file. Regenerating
    types did not fix it; the stale directory had to go. Worth
    knowing: **`npx next typegen` does not clean `.next/dev/types`.**
  - Verified: `npx next typegen`, `npx tsc --noEmit`,
    `npm run lint`, and `npm run build` all pass with no errors and
    no warnings — the specification's own last check is a build
    with no type errors. The build reports the same **eleven**
    routes plus `ƒ Proxy (Middleware)`; this unit adds components
    and types, not routes. Its TypeScript pass took 84s, which is
    the check that matters here: the shape, component, and colour
    unions are exhaustive, so a missing case in the renderer's
    `switch` or in either token map would have failed it.
  - **Not verified in a browser.** `LIVEBLOCKS_SECRET_KEY` is set
    now, so this is no longer blocked, but nothing here has been
    dragged, dropped, or seen: whether a drop lands under the
    cursor, whether the six shapes read correctly at their default
    sizes, whether a node appears for the other person in the room,
    and whether the toolbar scrolls sensibly at a narrow width are
    all **unverified**. A passing build says none of that.

- Unit 13 — Node drag preview and selection polish (2026-08-14):
  - **The existing SVG shape renderer was not replaced, and no
    shape was redrawn.** `canvas-node-shape.tsx` keeps all six
    paths exactly as unit 12 drew them. What changed in it is the
    stroke: it takes a width per render instead of a module
    constant, and the inset it lays every shape out inside is now
    half the *current* stroke rather than half a fixed one — so
    the heavier selected outline is not clipped by the viewBox
    either.
  - Added `canvasNodeStrokeWidths` to
    `features/canvas/canvas-node-tokens.ts`: `rest: 1.5` (the
    weight unit 12 used, so a node at rest is unchanged) and
    `selected: 2.5`. A stroke width is a **dimension**, so it
    belongs in the shared token map beside the sizes rather than
    inside the renderer — `ui-context.md` requires that map to be
    the only place either lives.
  - **Selection now changes two things, not one.** It was already
    `--border` → `--ring`; it is now that *and* the heavier
    weight, because `ui-context.md`'s interaction rules say not to
    rely on colour alone. The rest state was left subtle rather
    than strengthened — the specification asks for subtle at rest
    and brighter when selected, so the contrast comes from raising
    the selected state.
  - **Selection is drawn on the outline rather than as a CSS ring
    on the node wrapper**, which is the reason it could not have
    been a `ring-2` class: a ring is a rectangle, so it would sit
    *around* a hexagon, a circle, or a diamond instead of on it,
    and half the shapes would have had a selected state that did
    not match their own edge. A stroke follows whatever path the
    shape draws and scales with the node with the rest of its
    geometry.
  - **Every shape still scales with the node**, unchanged: the
    geometry is computed from the passed width and height, the
    pill's radius is still its own half-height, the circle is
    still an `ellipse`, and the hexagon's point is still capped in
    absolute units. The only new term in any of them is the
    stroke.
  - Added `features/canvas/canvas-node-body.tsx`, **the one
    drawing of a component**: the shape outline with the centred,
    two-line-clamped label over it, filling the box it is handed.
    It was lifted out of `canvas-node.tsx` verbatim — same
    classes, same insets, same clamp — so nothing about how an
    existing node looks changed.
  - **The extraction is what makes the preview honest.** The spec
    asks for the existing shape rendering "where practical"; with
    one component there is no second drawing to drift, so the
    ghost cannot end up a rectangle when the node will be a
    hexagon. `canvas-node.tsx` now composes the body and adds only
    what belongs to a *node*: React Flow's measured size, the
    selected flag, and the two handles.
  - Added `hooks/use-canvas-drag-preview.ts`, which holds the
    in-flight payload and the pointer position, and
    `features/canvas/canvas-drag-preview.tsx`, the ghost itself.
  - **The preview never touches Liveblocks.** It is React state in
    one hook — not Storage, because no node exists yet and a
    preview is not part of the document, and not Presence, because
    what somebody is *about* to drop is not something this unit
    shows the room. The only collaborative write is still the one
    `add` change on drop.
  - **The ghost is drawn from the payload that was actually
    written to the drag.** `writeCanvasComponentDragPayload` now
    returns what it wrote, so the shape, the label, the width, and
    the height on screen are the same values the drop handler will
    read — not a second construction of them from the catalogue.
    The colour is `DEFAULT_CANVAS_NODE_COLOR`, which is what the
    drop assigns, and `selected` is `false`: nothing exists yet for
    the user to have selected.
  - **The pointer is tracked from `dragover` on the document, not
    `mousemove`.** A native HTML5 drag suppresses mouse events
    entirely, so the drag events are the only ones carrying
    coordinates while a drag is in flight. That listener
    deliberately does **not** call `preventDefault`, so observing
    the drag does not turn the whole page into a drop target —
    where a component may actually be dropped is still decided by
    the canvas' own `dragover`, untouched.
  - The listener is subscribed **only while a drag is in flight**
    and on the document rather than the canvas, so the ghost keeps
    up with the cursor across the toolbar, the navbar, and both
    side panels, and nothing is listening the rest of the time.
  - **The ghost is portalled to `document.body` and positioned
    `fixed`.** Pointer coordinates address the viewport, which is
    what `fixed` resolves against; inside React Flow's transformed
    viewport the pan and the zoom would be applied to it a second
    time, and a preview clipped to the canvas region would vanish
    as the cursor crossed a panel. The portal is guarded on
    `typeof document`, since the canvas renders on the server too.
  - `pointer-events-none`, so the ghost is never the element under
    the cursor — without it the drop would land on the preview
    instead of the canvas — `opacity-70` for the transparency the
    specification asks for, and `z-50` to clear the two `z-40`
    side panels. It is centred on the cursor with a half-size
    translate, which matches the drop's own half-node offset, so
    the component lands where the ghost was.
  - `aria-hidden`: the component's name is already announced by the
    toolbar button being dragged, so repeating it would be noise
    during an interaction the user is performing by pointer
    anyway.
  - **The browser's own drag image is replaced with a transparent
    1×1 canvas.** Left alone it is a translucent snapshot of the
    toolbar button, which would follow the cursor *beside* our
    ghost as a second preview of one drag. A `canvas` rather than
    an `Image`, because `setDragImage` needs a fully loaded image
    and `dragstart` is not a moment to rely on that, while an
    undrawn canvas is transparent immediately. It is created lazily
    and kept, since this module is evaluated on the server where
    there is no `document`.
  - **The preview is removed on `dragend`.** That event fires on
    the drag source after a successful drop **and** after a
    cancellation — Escape, or a release outside a drop target — so
    one handler covers both cases the specification names, with no
    need for the canvas to report a drop back to the toolbar.
  - **The toolbar owns the state because the drag starts and ends
    there.** `dragstart` and `dragend` both fire on the source, so
    one hook mounted in `CanvasComponentToolbar` covers the whole
    lifecycle. The panel was **not rebuilt** — the same `Panel`,
    the same three groups, the same buttons, the same classes; it
    gained a fragment around the panel, a `dragend` handler, and
    the two lines that start the preview.
  - **The drop path is unchanged.** `architecture-canvas.tsx` was
    not edited at all: the same MIME type, the same Zod payload,
    the same `screenToFlowPosition` conversion, the same half-node
    offset, and the same `onNodesChange([{ type: "add", … }])`
    write into Liveblocks Storage.
  - **Out of scope and confirmed absent:** no node resizing, no
    label editing, no component-specific configuration, no
    component-panel rebuild, no change to how a dropped node is
    created, and no new shape. **No dependency was installed** —
    `createPortal` is from `react-dom`, which React already brings.
  - Verified: `npx next typegen`, `npx tsc --noEmit`,
    `npm run lint`, and `npm run build` all pass with no errors and
    no warnings, reporting the same **eleven** routes plus
    `ƒ Proxy (Middleware)` — this unit adds components and a hook,
    not routes.
  - **Not verified in a browser.** `LIVEBLOCKS_SECRET_KEY` is set,
    so nothing blocks it, but nothing here has been dragged or
    seen: whether the ghost tracks the cursor smoothly, whether
    suppressing the native drag image works across browsers,
    whether the transparency reads as a preview, and whether a
    selected node is now obviously selected at each of the six
    shapes are all **unverified**. A passing build says none of
    that.

- Unit 14 — Node editing (2026-08-14):
  - **The Unit 13 four-file structure is intact.** `canvas-node.tsx`
    still owns React Flow node behaviour, `canvas-node-body.tsx` the
    reusable visual body, `canvas-node-shape.tsx` the geometry, and
    `canvas-node-tokens.ts` the shared sizing and visual tokens.
    Nothing was collapsed and nothing was duplicated:
    `canvas-node-shape.tsx` was **not edited at all**, so no shape was
    redrawn and no geometry changed.
  - Added `minWidth` and `minHeight` to every entry of
    `canvasNodeShapeTokens`. **Per-shape, for the same reason the
    default size is per-shape**: it is the shape that decides how much
    room a label needs, so a hexagon's floor (128×72) is wider than a
    rectangle's (96×48) at the same drawn width, and a cylinder's
    height floor leaves room for its rim *and* the label beneath it.
    `circle`'s floor is square (64×64), because a circle resizes with
    its ratio locked and a non-square floor would be a limit it could
    never reach. **No minimum is written in the renderer** —
    `ui-context.md` requires a dimension to live in that map.
  - Added `canvasNodeResizeControlStyles` to the same map: an `8px`
    hollow square on `--card`, outlined in the `--ring` the selected
    node is already stroked with, and edges in that colour mixed to
    45%. So the controls read as part of the selected outline rather
    than as a second highlight, and the handle is a size that can
    actually be hit — React Flow's own is 5px.
  - **Those are inline styles rather than Tailwind classes, and
    specificity forced it.** `base.css` styles a control through
    `.react-flow__resize-control.handle`, two classes, so a single
    utility class on the same element loses to it and the handle keeps
    a hardcoded `1px solid #fff` border and the default `--xy-resize`
    fill. An inline style wins outright. The values are still
    `var(--token)` references, so no literal colour was introduced;
    `ui-context.md` records the exception.
  - Added `NodeResizer` in `canvas-node.tsx` — the node level, where
    React Flow behaviour belongs — with `isVisible={selected}`, so an
    unselected component carries no controls at all.
  - **A circle stays circular via `keepAspectRatio`.** Its default
    size is square, and `getDimensionsAfterResize` computes the ratio
    from the node's size at the *start* of the gesture, so the lock is
    at 1:1. Every other shape resizes freely on both axes, and the
    SVG is an `ellipse` rather than a `circle`, so nothing breaks if a
    circle stored by an older version is not square.
  - **Every shape already scaled with the box**, so nothing had to be
    changed for it: the geometry is computed from the passed width and
    height, the pill's radius is its own half-height, the hexagon's
    point is capped in absolute units, and the selected outline
    behaviour from Unit 13 is untouched.
  - **No second copy of a node's dimensions exists.** `NodeResizer`
    emits a `dimensions` change to `onNodesChange`, which *is* the
    Liveblocks mutation, and the body is drawn from the measurement
    React Flow passes back in — the same route a drag already took.
  - **No manual history handling was added for resizing, because the
    integration already does it.** Read in
    `@liveblocks/react-flow/dist/lib/flow.js`: `applyNodeChanges`
    calls `history.pause()` when a `dimensions` change arrives with
    `resizing: true` and `history.resume()` on `resizing: false`, so a
    drag is already one undo step. Pausing again from the renderer
    would have nested a pause nothing balanced. The specification
    asked for exactly this check.
  - Added inline label editing to `canvas-node-body.tsx`, which
    **keeps the normal label rendering**: the `line-clamp-2` span is
    unchanged and is what renders whenever the editor is closed, so
    the drag preview — which passes no editor — is byte-for-byte what
    Unit 13 drew.
  - **The editor takes the label's position rather than being layered
    over it**, so opening it neither shifts the text nor shows it
    twice. Same centred box, same `text-sm font-medium`, same
    per-shape inset. `field-sizing-content` with `min-h-0` is what
    keeps it centred as the text wraps: a textarea stretched to fill
    the shape would put the first line against its top edge.
  - Nearly every one of the `Textarea` primitive's box styles is
    overridden — border, padding, background, minimum height, and
    focus ring all belong to a form field on a panel. **The primitive
    itself was not modified** (`components/ui/` is protected); the
    overrides are classes at the call site. The focus ring goes for
    Unit 13's reason: a ring is a rectangle, so it would sit around a
    hexagon or a circle instead of on it.
  - **The label is not held anywhere locally.** A keystroke calls
    `updateNodeData(id, { label })`, which React Flow diffs into a
    `replace` change on `onNodesChange` — the Liveblocks handler,
    whose `replace` branch reconciles the node in Storage — so the
    text on screen is the collaborative value being typed and the
    room sees the rename as it happens. This is why **`Escape` has
    nothing to revert**: it closes the session and no more. A local
    draft committed on blur would be the second copy of node state
    that `useLiveblocksFlow` exists to avoid.
  - Blur closes the editor too, which covers clicking the canvas,
    another node, or anything outside it.
  - An empty label shows a centred `Name this component` placeholder
    in the primitive's own `--muted-foreground`, and the
    double-click is taken on the whole label area rather than on the
    text — otherwise a component with no label would have nothing to
    aim at.
  - **`nopan` on the label area is what stops the opening
    double-click from also zooming the canvas.** React Flow's zoom is
    a d3 listener on the pane below React's own root, so a synthetic
    `stopPropagation` would run too late to prevent it; d3 calls its
    filter first (`d3-zoom/src/zoom.js` `dblclicked`), and
    `createFilter` rejects any event inside `nopan`. The textarea
    carries `nodrag nopan` as well, so clicking into it or selecting
    text across it moves neither the node nor the canvas.
  - **One editing session is one undo step.** Liveblocks history is
    paused when the editor opens and resumed when it closes, so the
    run of keystrokes commits as a single frame. `pause()` is not
    reference-counted by Liveblocks, so a `useRef` tracks whether
    *this* session is the one holding the pause before resuming — a
    stray `resume()` would otherwise commit whatever another pause is
    holding, and a resize gesture pauses the same history.
  - **History is also resumed on unmount.** An editor can go away
    without a blur — the node is deleted, another person in the room
    removes it, or the canvas unmounts with the textarea focused —
    and leaving history paused would swallow every later change into
    a frame nothing commits. The cleanup runs on unmount only and
    does nothing unless this session holds the pause, so history is
    never left paused after blur, `Escape`, or teardown.
  - **Editing state is local to one browser.** Whether the editor is
    open is `useState` in the node renderer and reaches neither
    Liveblocks Storage — a room's document is the diagram, not who is
    midway through renaming part of it — nor Presence, which this
    unit still never writes, nor Prisma, which holds no canvas state
    at all. Focus is the browser's own and nothing mirrors it. Only
    the resulting label is collaborative.
  - **Out of scope and confirmed absent:** no change to shape
    geometry, no change to the Unit 13 drag preview, no change to the
    component panel, no change to how a dropped node is created
    (`architecture-canvas.tsx` was not edited), no change to the node
    colour model, no properties panel, no component-specific
    configuration fields, and no edge editing. **No dependency was
    installed** — `NodeResizer` is in `@xyflow/react` and
    `useHistory` in `@liveblocks/react`, both already present.
  - Verified: `npx next typegen`, `npx tsc --noEmit`,
    `npm run lint`, and `npm run build` all pass with no errors and
    no warnings, reporting the same **eleven** routes plus
    `ƒ Proxy (Middleware)` — this unit changes components and tokens,
    not routes.
  - **Not verified in a browser.** Nothing here has been resized or
    renamed: whether the handles are easy to grab at a low zoom,
    whether a circle actually stays circular through a corner drag,
    whether the textarea stays visually centred as text wraps in each
    of the six shapes, whether one session really collapses to one
    undo, and whether a rename appears live for the other person in
    the room are all **unverified**. A passing build says none of
    that.

- Unit 15 — Node colour toolbar (2026-08-18):
  - **The Unit 14 four-file structure is intact.**
    `canvas-node.tsx` still owns React Flow node behaviour,
    `canvas-node-body.tsx` the reusable visual body,
    `canvas-node-shape.tsx` the geometry, and
    `canvas-node-tokens.ts` the shared sizing and visual tokens.
    `canvas-node-shape.tsx` was **not edited at all** for the second
    unit running: it already read every colour by key from the token
    map, so extending the palette reached the outline with no change
    to it. No colour or styling logic was duplicated across the four.
  - **Extended the existing `CanvasNodeColor` and
    `canvasNodeColorTokens` rather than adding a second colour
    system.** `CanvasNodeColor` is now
    `"default" | "blue" | "green" | "amber" | "red"`, the five keys
    the specification names, and the map has an entry for each.
  - **The four new colours are mixed from palette tokens the
    interface already has** — `--primary`, `--success`, `--warning`,
    and `--destructive` — following the derived-token pattern
    `ui-context.md` sets out, rather than four new hex values. A
    surface is the hue 20% into `--card`, a border the hue 55% into
    `--border`, the selected outline the hue itself, and a label
    `--foreground` carrying 14% of the hue. So the canvas grows no
    second palette and the themes track the theme.
  - The mixing is expressed **once**, in a local
    `tintedCanvasNodeColor(name, token)` helper, because the four
    differ only in which token they are mixed from. `default` is
    written out, since it is `--card`/`--border`/`--ring` and not a
    tint of anything.
  - **A colour key resolves to all three values through one
    mechanism.** `labelClassName` on `CanvasNodeColorTokens` became
    `labelColor`, a colour string like `surface` and `border` already
    were — so a background, a text colour, and a border are read the
    same way and cannot split across a class system and an attribute
    system. The label and the label editor in `canvas-node-body.tsx`
    now take `style={{ color: labelColor }}`; nothing else changed
    there, so the two-line clamp, the shape inset, and the editor's
    position and behaviour are Unit 14's.
  - Colours are **visual choices only.** Nothing reads a node's
    colour to decide anything: `red` is not an error state and
    `green` is not a completed one, and that a hue is mixed from
    `--destructive` is a source for the colour and nothing more. No
    WorkHQ or Design Studio semantics were attached (invariant 7),
    and no component in the catalogue was given a colour — every
    component still starts on `default`.
  - **A node stores only the colour key.** No background, text, or
    border value is written to node data, so recolouring cannot leave
    three fields disagreeing, and a node stored by an older version
    still reads: `data.color` is optional and falls back to
    `DEFAULT_CANVAS_NODE_COLOR` exactly as before.
  - Added `canvasNodeColors`, the colour names as a runtime list
    **derived from the map** — the same pattern `canvasNodeShapes`
    already used — so a theme added to the map becomes a swatch with
    no change to the toolbar. Insertion order is swatch order.
  - Added `canvasNodeToolbarOffset` (14) to the same map. A gap is a
    dimension, so it belongs there rather than as a number in the
    renderer. It clears the resize handles as well as the outline: a
    handle is 8px and is centred on the node's corner, so 4px of it
    sits above the top edge. React Flow applies the offset after the
    viewport scale and does not scale the toolbar, so the gap is
    constant at every zoom.
  - Added React Flow's `NodeToolbar` in `canvas-node.tsx` — **the
    node level, where React Flow behaviour belongs**, and not in
    `canvas-node-body.tsx`, which is shared with the drag preview
    that has no node to recolour. `isVisible={selected}`, so an
    unselected component carries no toolbar, matching the
    `NodeResizer` line above it.
  - `position={Position.Top}` with that offset, so it floats above
    the node without overlapping it. The toolbar does not scale with
    the canvas — React Flow's own behaviour — so the swatches stay
    hittable at a low zoom.
  - One swatch per theme, drawn in **that theme's own surface and
    border**, so what is being chosen is what will appear on the
    canvas rather than a flat block of the hue. The pill around them
    is the component toolbar's treatment — bordered, on `--card`,
    with a shadow and a backdrop blur — so the two read as the same
    kind of overlay.
  - **The active swatch is marked three ways, not one:** a tick, the
    selected border colour, and the heavier of the two existing
    `canvasNodeStrokeWidths`. So it is identifiable without relying on
    colour (`ui-context.md`), it introduces no new numbers, and
    `aria-pressed` says the same thing to a screen reader. A colour
    has no accessible name of its own, so each swatch takes the
    theme's display `name` from the token map as both its
    `aria-label` and its `title`.
  - Hover is a slight lift in brightness (`hover:brightness-150`),
    which on a dark tinted surface is a subtle change rather than a
    highlight competing with the selected outline beside it — and it
    needs no second set of hover colours in the map.
  - **`nodrag`, `nopan`, and `nowheel` on the toolbar, and they are
    load-bearing.** Read from the shipped source:
    `NodeToolbarPortal` portals into `.react-flow__renderer`, and
    `ZoomPane` *is* that element — d3-zoom is bound to it — so
    without the classes a press on a swatch would pan the canvas, a
    double click would zoom it, and a scroll over the pill would zoom
    too. A synthetic `stopPropagation` could not prevent it, for
    Unit 14's reason. Node dragging was already safe, because the
    portal takes the toolbar out of the node wrapper, but `nodrag` is
    on it anyway so that guarantee does not depend on where React
    Flow portals it. Deselection was also already safe:
    `.react-flow__pane`, which owns the pane click, is a *child* of
    the renderer, so a toolbar click never bubbles through it.
  - **Choosing a swatch writes only `color`.** `useCanvasNodeColor`
    calls `updateNodeData(id, { color })` — the route the label
    already takes, which React Flow diffs into a `replace` change on
    `onNodesChange`, and that handler is the Liveblocks mutation. So
    the new colour is in Storage and on every collaborator's screen
    immediately, with **no server API call, no route, and no Prisma
    write**, and the label, shape, component type, position, and size
    are untouched.
  - **No second copy of node colour exists.** The active swatch is
    read back from the node's own `data.color`, so there is one
    colour per node and no local state to fall out of step with the
    room.
  - **No history handling around a recolour**, unlike the label
    editor: one click is one complete change, so it is already one
    undo step, and pausing anything would risk unbalancing a pause a
    resize gesture owns.
  - **Toolbar visibility is local to one browser.** It is React
    Flow's own `selected` flag and nothing else — no open state was
    added at all — so it reaches neither Liveblocks Storage nor
    Presence, which this unit still never writes, nor Prisma, which
    holds no canvas state. Only the resulting colour is
    collaborative.
  - **Out of scope and confirmed absent:** no change to drag and
    drop (`architecture-canvas.tsx`, `canvas-drag-payload.ts`, and
    `canvas-node-id.ts` were not edited), no change to the component
    panel or the drag preview (`canvas-component-toolbar.tsx` and
    `canvas-drag-preview.tsx` were not edited — the preview still
    draws in `DEFAULT_CANVAS_NODE_COLOR`), no change to resizing, no
    change to label editing beyond where the label's colour comes
    from, no full colour picker, no custom user-defined colours, no
    architectural meaning on a colour, no component-specific styling
    rules, and no properties panel. **No dependency was installed** —
    `NodeToolbar` is in `@xyflow/react` and `Check` in
    `lucide-react`, both already present. No stylesheet import was
    needed either: neither `base.css` nor `style.css` carries a
    `.react-flow__node-toolbar` rule, so the toolbar is positioned by
    inline styles React Flow computes itself.
  - Verified: `npx next typegen`, `npx tsc --noEmit`,
    `npm run lint`, and `npm run build` all pass with no errors and
    no warnings, reporting the same **eleven** routes plus
    `ƒ Proxy (Middleware)` — this unit changes components, tokens,
    and a type, not routes.
  - **Not verified in a browser.** No swatch has been clicked:
    whether the five surfaces are actually distinguishable on the
    dark canvas, whether each label stays legible on its own surface,
    whether the toolbar sits clear of the resize handles at a low
    zoom, whether the pill's own gestures really stay off the canvas,
    and whether a recolour appears live for the other person in the
    room are all **unverified**. One risk here is specific and a
    passing build cannot speak to it: `surface` and `border` are
    handed to SVG **presentation attributes**, and those values are
    now `color-mix()` rather than a plain `var()`. A presentation
    attribute is parsed as a CSS value, so both should substitute —
    but that is reasoning from the specification, not an observation,
    and the existing `var()` usage has never been seen rendered
    either. If a shape renders unfilled, move the fill and stroke to
    an inline `style` on the SVG element, where substitution is
    unambiguous; the token map does not change.

- Unit 16 — Edge behavior (2026-08-18):
  - **Four connection handles per node, replacing the two that were
    there.** The existing handles were inspected first, as the
    specification asks: `canvas-node.tsx` had a `type="target"` on
    the left and a `type="source"` on the right. Both were removed
    and one `Handle` per side is now rendered from a
    `canvasNodeHandles` list, so a node ends with **exactly four**
    and no handle is duplicated. Handle behaviour stays at the
    `canvas-node.tsx` level; `canvas-node-body.tsx` and
    `canvas-node-shape.tsx` were **not edited**.
  - The IDs are **side-based and stable** — `top`, `right`, `bottom`,
    `left` — because they are part of the collaborative document: an
    edge in Storage records which handle each end attaches to, so
    renaming one would detach every existing connection.
  - **No strict source/target semantics.** `ConnectionMode.Loose` is
    unchanged, and all four handles are declared `type="source"`,
    which is not a direction. Read from the shipped `@xyflow/system`
    source: `getEdgePosition` resolves an edge's target end from
    `target.concat(source)` unless the mode is Strict, and
    `isValidHandle` in loose mode rejects only a handle connecting to
    itself — so any of the four can start a connection and any can
    receive one. Declaring a side a source or a target would have
    been exactly the semantics the specification forbids.
  - The same source also confirmed that an edge stored before this
    unit, whose `sourceHandle` is `null`, falls back to the node's
    first measured handle bounds, so existing connections still
    route.
  - **Handles stay mounted when they are not visible.** The fade is
    `opacity` alone — `opacity-40` at rest, `opacity-100` on
    `group-hover` or when the node is selected — never
    `display: none` and never conditional rendering, because React
    Flow measures a node's handles to place edge endpoints and an
    unmounted or undisplayed handle loses its measured box, taking
    its connections' endpoints with it. `group` was added to the node
    wrapper for the hover, since React Flow's own node element is not
    ours to class.
  - Added `canvasNodeHandleStyle` to the **existing**
    `canvas-node-tokens.ts` — a small `--foreground` dot with a
    `--background` border — rather than a colour in the renderer. It
    is an **inline style**, and the reason is not the obvious one:
    `base.css` sets a handle's background through the single class
    `.react-flow__handle`, but Tailwind v4 emits utilities inside
    `@layer utilities`, and an unlayered declaration beats a layered
    one whatever the source order, so a `bg-*` class would lose
    outright. The rest/hover opacity stays in classes, because hover
    is a CSS state an inline style cannot express and `base.css` sets
    no opacity on a handle.
  - **The existing shared `canvasEdge` type was extended, not
    replaced.** `CanvasEdgeData` went from `Record<string, never>` to
    `{ label?: string }` — one field — so there is **one edge model**
    and `liveblocks.config.ts`, which types Storage from it, needed
    no change. The label lives in `data` rather than React Flow's
    top-level `label` because it is drawn as HTML and edited through
    `updateEdgeData`.
  - **A missing label is read as `""`**, in the renderer, so a
    connection stored before this field existed renders as an
    unlabelled one rather than crashing or showing `undefined`.
  - Added `features/canvas/canvas-edge-tokens.ts`, the sibling of the
    node token map, holding every value a connection is drawn with:
    the stroke colour, the rest and active stroke weights, the rest
    and active opacities, the corner radius, the interaction width,
    the arrowhead, and the edge defaults. The renderer holds no
    colour and no number of its own. Connections got their own file
    rather than joining the node map because nothing in one is a
    measurement of the other.
  - **New-edge defaults are React Flow's `defaultEdgeOptions`**, not
    values copied onto each edge as it is created. Read from the
    shipped source: React Flow merges them into the connection
    *before* `onConnect` runs, so a dragged edge reaches Storage as a
    `canvasEdge` with `data.label: ""` and an arrowhead **through the
    existing Liveblocks `onConnect`** — no local edge state, no
    second creation path, and no defaults repeated per edge. The same
    object is merged again at render, so an edge stored before this
    unit is drawn the new way too.
  - `markerEnd` had to be a default rather than a renderer concern,
    because React Flow generates the SVG `<marker>` definitions from
    the edges and from `defaultEdgeOptions`. The stroke, the opacity,
    and the interaction width are deliberately **not** defaults: the
    first two change with hover and selection, which a static default
    cannot express.
  - Added `features/canvas/canvas-edge.tsx`, the `canvasEdge`
    renderer: `getSmoothStepPath` for clean right-angle routing with
    softened corners, drawn through `BaseEdge` using **the path that
    function returns**, a thin `--muted-foreground` stroke with
    rounded ends, and the arrowhead passed through to the target end.
  - **Active state is two channels, matching the node convention:**
    an edge at rest is dimmed and thin, and a hovered, selected, or
    being-edited one is at full opacity and slightly heavier — so it
    does not read as active by brightness alone. The dimming is
    `opacity` rather than `stroke-opacity`, which is load-bearing: a
    marker is painted as part of the path's rendering, so `opacity`
    carries the arrowhead with the line while `stroke-opacity` would
    fade the line and leave the arrow at full strength.
  - **Easy to select without a thicker visible line.** `BaseEdge`
    draws a second, fully transparent path along the same geometry at
    `interactionWidth`, so only the hit area grows. The renderer
    wraps both paths in its own `<g>` for the hover and double-click
    handlers, because `BaseEdge` puts the props it is given on the
    *visible* path only — the wide invisible one would otherwise take
    none of them.
  - **The label sits at `labelX`/`labelY` from `getSmoothStepPath`**,
    never a midpoint computed from the endpoints — which would leave
    the label off the line as soon as a route turned a corner. It is
    positioned through `EdgeLabelRenderer` with React Flow's
    documented two-translation centring.
  - A label is a **small pill** on the canvas' floating-surface
    treatment — bordered, on `--card`, with a shadow and a blur — so
    it reads as the same kind of thing as the toolbars. A **selected**
    edge with no label shows a faint dashed hint instead; an
    unselected unlabelled edge shows nothing at all, so a canvas of
    connections is not a canvas of hints.
  - **Double-click the edge or its label area to edit in place.** The
    input takes the pill's shape and grows with the text
    (`field-sizing-content` over a minimum width), is initialised
    from the current label, and closes on **blur, `Enter`, and
    `Escape`**. `Escape` does not revert, for Unit 14's reason: every
    keystroke is already in the collaborative document.
  - **The label updates through the existing collaborative flow.**
    `updateEdgeData(id, { label })` is diffed by React Flow into a
    `replace` change on `onEdgesChange`, and that handler is the
    Liveblocks mutation — so the room sees the label as it is typed,
    with no server API call, no Prisma write, and **no second edge
    store or local draft**.
  - **Label interactions do not drag or pan the canvas.** The label
    wrapper carries `nodrag nopan` and the edge group carries
    `nopan`; the label layer's own `pointer-events: none` is undone
    with `pointer-events-auto` on the wrapper, as interactive content
    inside `EdgeLabelRenderer` requires. `nopan` is what stops the
    opening double-click from also zooming: d3-zoom's filter rejects
    events inside that class, and a synthetic `stopPropagation` would
    run too late.
  - **One editing session is one Liveblocks history operation**,
    following Unit 14's node-label pattern exactly:
    `useCanvasEdgeLabelEditor` pauses on begin and resumes on end,
    with a `useRef` guard so it never resumes a pause another gesture
    owns, and an unmount cleanup so an edge deleted mid-edit cannot
    leave history paused. Only the resulting label is collaborative —
    whether the editor is open, and whether the edge is hovered, are
    **local React state**, reaching neither Storage nor Presence nor
    Prisma.
  - `canvasEdgeTypes` is defined at **module scope**, for the reason
    `canvasNodeTypes` is: React Flow re-registers on a new object
    identity, so an inline literal would remount every edge on each
    render.
  - **The collaborative architecture is unchanged.**
    `architecture-canvas.tsx` gained exactly two props —
    `edgeTypes` and `defaultEdgeOptions` — and nothing else:
    `useLiveblocksFlow` is still the single source of nodes and
    edges, and `onNodesChange`, `onEdgesChange`, `onConnect`, and
    `onDelete` are untouched. There is no second node or edge store.
  - **Out of scope and confirmed absent:** no change to node creation
    or the drop handler, none to the component panel
    (`canvas-component-toolbar.tsx` not edited), none to the drag
    preview (`canvas-drag-preview.tsx` and
    `use-canvas-drag-preview.ts` not edited), none to node resizing,
    node label editing, or node colour behaviour, and no redesign of
    node rendering beyond the handles. **No semantic connection
    validation**, **no relationship types** (invokes, uses, reads,
    writes), and **no per-relationship colours or styles** — those
    would be inventing architectural semantics neither product has
    been specified to have (invariant 7). **No dependency was
    installed**: `BaseEdge`, `EdgeLabelRenderer`,
    `getSmoothStepPath`, and `MarkerType` are all in the
    `@xyflow/react` already present, and no extra stylesheet import
    was needed — `base.css` already carries the edge, marker, and
    label-renderer rules.
  - Also updated `ui-context.md`: the stale "two connection handles"
    paragraph now describes four, the inline-style reason, and the
    stay-mounted rule, and two new sections — **Connections** and
    **Connection labels** — record the routing, the two-channel
    active state, the hit band, the edge-defaults approach, and the
    pill, hint, editor, and gesture-class conventions.
  - Verified: `npx next typegen`, `npx tsc --noEmit`,
    `npm run lint`, and `npm run build` all pass with no errors and
    no warnings, reporting the same **eleven** routes plus
    `ƒ Proxy (Middleware)` — this unit changes components, tokens,
    and a type, not routes.
  - **Not verified in a browser.** No connection has been drawn. The
    reasoning about loose mode, the four `type="source"` handles, and
    the `defaultEdgeOptions` merge order comes from reading
    `@xyflow/system` and `@xyflow/react`'s shipped source, not from
    an observation — so whether a drag between two arbitrary sides
    actually completes, whether a handle at `opacity-40` is findable
    on the dark canvas, whether the arrowhead is legible at a low
    zoom, whether the double-click reliably beats the pane's own
    click, and whether a label appears live for the other person in
    the room are all **unverified**. One risk a passing build cannot
    speak to: `CANVAS_EDGE_STROKE` is a `var(--muted-foreground)`
    reference handed to the marker's `color`, and React Flow writes a
    marker's colour into an SVG `fill` **presentation attribute** —
    which should substitute, since a presentation attribute is parsed
    as a CSS value, but that is the specification rather than an
    observation. If an arrowhead renders black, give the marker a
    resolved colour or move the fill to an inline style; the token
    map's shape does not change.

- Unit 17 — Canvas ergonomics (2026-08-19):
  - Added `features/canvas/canvas-control-bar.tsx`, the floating pill
    at the bottom-left: a React Flow `Panel` carrying `nopan nowheel`,
    holding a **zoom** group (zoom out, fit view, zoom in) and a
    **history** group (undo, redo) either side of an inset divider.
    Fit view sits *between* the two zoom controls rather than beside
    them, because it is the way back from either.
  - The controls are the shadcn `Button` primitive in its
    `variant="ghost" size="icon-sm"` form with the radius rounded to a
    circle, rather than the bare `button` elements the component
    toolbar uses for its drag sources. That is `code-standards.md`'s
    order of preference, and it is also what **dims a disabled
    control**: `disabled:opacity-50` and `disabled:pointer-events-none`
    come with the primitive, so an unavailable history action needed no
    second set of styles.
  - The divider carries **`self-stretch`, which is load-bearing**: the
    pill is `items-center`, where a `w-px` element with no content
    computes to zero height and the rule would not be drawn at all.
  - **Zoom and fit view are React Flow's own viewport methods** —
    `zoomIn`, `zoomOut`, and `fitView` from `useReactFlow`, read from
    the same store the drop handler uses, since `ReactFlowProvider` is
    already mounted above the flow. Nothing here computes a zoom level
    or writes a transform, and no viewport state is stored.
  - Each call passes `duration: CANVAS_VIEWPORT_ANIMATION_DURATION`
    (200ms). React Flow animates **only** when a duration is given —
    its own default is an instant jump — and a jump loses the reader's
    place on a large diagram, because nothing connects what was in view
    to what is now. The promise each call returns is discarded with
    `void`: a control has finished as soon as the movement starts.
  - **Undo and redo are Liveblocks history and nothing else.**
    `useUndo`, `useRedo`, `useCanUndo`, and `useCanRedo` from
    `@liveblocks/react/suspense` — the same entry point the node and
    edge label editors import `useHistory` from. No stack is kept here,
    and React Flow's local state is not used as an alternative history
    system: every canvas change already goes through
    `useLiveblocksFlow`, so the room's history is a complete record of
    this client's edits and there is nothing to keep in step.
  - The disabled states come from `canUndo`/`canRedo` directly, so the
    buttons follow the room's own history rather than a count kept
    here. The **keyboard shortcuts are deliberately not gated on
    them**: Liveblocks does nothing when there is nothing to undo, so a
    guard in the hook would be a second opinion about a stack it does
    not own.
  - Added `hooks/use-keyboard-shortcuts.ts`. It **receives** the four
    actions and imports neither React Flow nor Liveblocks, so a key and
    the button beside it are the same call rather than two definitions
    of one action. The bar is where it is mounted, because that is the
    one component where all four are already gathered, and it lives
    exactly as long as the canvas does.
  - The listener is on `window`, not on the canvas element: React
    Flow's viewport is not focusable, so requiring focus would mean the
    keys did nothing on a freshly opened workspace. It is registered
    **once** — the actions are read through a ref that is refreshed each
    render — so a caller's fresh callbacks do not tear the listener down
    and rebuild it.
  - **An event from a text field is left alone**, which is what
    preserves unit 14's node label editing and unit 16's edge label
    editing: `closest("input, textarea, select")` so that being
    *inside* one counts, plus `isContentEditable`, which is inherited
    and so is already true on a descendant of an editable region and
    already false for `contenteditable="false"`. Without it, typing `-`
    into a label would zoom the canvas out and `Cmd + Z` in a field
    would undo somebody's last component.
  - `metaKey` and `ctrlKey` are treated as one modifier, so the binding
    is correct on macOS and on Windows with **no platform detection
    anywhere** — nothing to keep in step, and no value in the markup
    the server could not know. `event.key` is lower-cased for the
    history keys, because `Cmd + Shift + Z` arrives as `Z`.
  - Zoom accepts `+`, `=`, and `-` **unmodified or with `Shift`** —
    which is how `+` is typed on most layouts — and returns early on
    `Alt`. Reading `event.key` rather than a key code means the number
    row and the numeric keypad both arrive as the same character with
    nothing to special-case.
  - **`preventDefault()` is called only on a keypress that is
    handled**, and every modified key other than `Z` and `Y` returns
    untouched, so `Cmd/Ctrl + =` and `Cmd/Ctrl + -` stay the browser's
    page zoom — an accessibility feature, not the canvas' to take. An
    event that is already `defaultPrevented` is skipped too, so a
    dialog closing on a key does not also run a canvas action.
  - Added `features/canvas/canvas-control-tokens.ts`, the third sibling
    of the node and edge token maps: the animation duration, the shared
    `canvasFitViewOptions`, and the bar's bottom offset. `ui-context.md`
    requires a dimension to live in a shared map rather than in a
    component, and controls get their own file for the same reason
    edges did — nothing in one file is a measurement of another. It
    holds **no colour**: the pill is Tailwind classes against the
    palette, as the other overlays are.
  - **The bar is lifted clear of the component toolbar rather than
    relying on a horizontal gap.** That pill is bottom-*centre* and
    grows to nearly the full width of the canvas, so at any window
    narrow enough for it to reach its maximum the two would meet in
    this corner. The offset is an **inline `bottom`**, not a utility
    class: `base.css` pins a bottom panel with `bottom: 0` through
    `.react-flow__panel.bottom`, the same specificity a class has, so
    which one won would depend on the order the two stylesheets end up
    in — while an inline value cannot lose. `Panel` forwards `style` to
    its own div (verified in the shipped source), so nothing was
    wrapped to achieve it.
  - **Removed the `MiniMap`**, its four token colours, and its
    `position="top-right"`. The dot-pattern `Background` is untouched.
    An overview of the whole diagram is a navigation aid for a canvas
    larger than the viewport, which fit view now covers, and keeping
    both would leave two overlays competing for the same corners as the
    component toolbar.
  - `fitViewOptions={{ maxZoom: 1 }}` on `<ReactFlow>` became
    `fitViewOptions={canvasFitViewOptions}` — the same value, now
    shared, so the fit-view **button** comes to rest where the canvas'
    own first fit does. That floor is not cosmetic: fitting a single
    component fills the viewport with it, so a canvas holding one node
    would jump to an enormous zoom.
  - **Nothing else in `architecture-canvas.tsx` changed.**
    `useLiveblocksFlow` and its four handlers, `onDelete`,
    `ConnectionMode.Loose`, `colorMode="dark"`, `defaultEdgeOptions`,
    both custom type maps, and the drag-and-drop handlers are
    byte-for-byte what unit 16 left. No node or edge rendering, no
    component panel, and no colour behaviour was touched, and nothing
    was added to Storage, Presence, or Prisma — **a viewport is
    client-local**, so no viewport state is persisted and there is no
    collaborative viewport syncing.
  - **No dependency was installed.** `Panel` and `useReactFlow` are
    React Flow's, the four history hooks are already in the installed
    `@liveblocks/react`, and `lucide-react` supplies `ZoomIn`,
    `ZoomOut`, `Maximize`, `Undo2`, and `Redo2` — each verified against
    the package's own barrel `.d.ts` rather than assumed.
  - Verified: `npx next typegen`, `npx tsc --noEmit`, `npm run lint`,
    and `npm run build` all pass with no errors and no warnings,
    reporting the same **eleven** routes plus `ƒ Proxy (Middleware)` —
    this unit adds components and a hook, not routes.
  - **Not opened in a browser, and a build cannot speak to most of this
    unit.** Unverified: that the bar actually clears the component
    toolbar at the widths where they would otherwise meet; that the
    zoom animation reads as smooth rather than sluggish at 200ms; that
    fit view frames a populated canvas sensibly; that undo takes back a
    drop, a move, a resize, a recolour, a rename, and a connection as
    single steps rather than several; that the two disabled states
    actually flip as history fills and empties — which needs a room,
    since `canUndo` is the room's answer and not a local count; and
    that every shortcut fires while none of them reaches a label
    editor. The last is the one to check first, because it is the only
    way this unit could break something that already worked: if a
    keystroke ever zooms the canvas while a label is being typed, the
    editable-target test is what to look at, not the bindings.
  - Updated `context/ui-context.md` (a **Canvas control bar** section
    and a **Canvas keyboard shortcuts** section, the MiniMap paragraph
    replaced by why there is no longer one, and the `style.css` note
    corrected — the controls it styles are React Flow's `Controls`
    component, which is still not what this canvas renders) and
    `context/architecture.md` (four new **Collaborative canvas**
    invariant bullets on Liveblocks history, the paused-history rule,
    the client-local viewport, and the shortcuts hook, plus the token
    map bullet now naming three files).

- Unit 18 — IA starter templates (2026-08-19):
  - Added `features/canvas/starter-templates.ts`: the `CanvasTemplate`,
    `CanvasTemplateNode`, and `CanvasTemplateEdge` types and the
    three-entry `CANVAS_TEMPLATES` array — WorkHQ Agentic Workflow
    (trigger → action → agent → human task → connector), Design Studio
    Queue Processing (work queue → process → business object →
    external application), and Hybrid WorkHQ + Digital Worker (the
    WorkHQ front end handing off to a digital worker, then process →
    business object → external application).
  - **A template describes structure, not appearance.** It carries a
    component type, a top-left position, a colour key, and the two
    handle sides each connection runs between — and nothing else.
    The label, the shape, the size, the stroke, and the edge style are
    read back from `canvas-components.ts`, `canvas-node-tokens.ts`,
    and `canvas-edge-tokens.ts`, so **no component-to-shape,
    component-to-size, node styling, or edge styling rule is
    duplicated** and a template cannot drift from what dragging the
    same components onto the canvas produces.
  - `resolveCanvasTemplateNodes()` is the **one** place a template node
    becomes drawable, and both the preview and the import go through
    it, so the picture on a card and the architecture that lands cannot
    disagree. A component type that has left the catalogue is
    **skipped** rather than drawn as a fallback rectangle, and the
    connections attached to it are dropped by both consumers.
  - The `hybrid` template is laid out over **two rows**, not one: six
    components in a line make a strip too wide to read either on the
    canvas or in a card, so the one vertical connection is also the one
    that shows where WorkHQ hands over to Design Studio.
  - Promoted the four handle names to `CanvasNodeHandleId` in
    `types/canvas.ts` and annotated `canvasNodeHandles` with it, so a
    template's edges are **compile-time linked** to the sides
    `canvas-node.tsx` actually declares — a template naming a fifth
    side would not build. The `Position` values stay in the renderer,
    so `types/` still reaches into no feature. **No rendering
    behaviour changed.**
  - Exported the shape geometry as `CanvasNodeShapePath` (was a private
    `ShapePath`). The preview lays every component out inside **one**
    `<svg>`, so it cannot compose `CanvasNodeShapeOutline` — that
    component *is* an `<svg>` filling a single node's box — and sharing
    the geometry is what makes a preview an honest picture. The
    outline's own behaviour is unchanged.
  - Added `features/canvas/canvas-template-import.ts`, a pure function:
    it reads a template and returns new nodes and edges, touching no
    Storage, no React Flow store, and no React state. **Nothing in
    `CANVAS_TEMPLATES` is mutated or handed out** — every node, edge,
    `position`, and `data` object is newly built — so importing the
    same template twice gives two independent architectures.
  - **Fresh runtime IDs, and the existing conventions for both.** Nodes
    use `createCanvasNodeId`, the helper a drop already uses, because a
    node ID is a key in a shared `LiveMap` and reusing the template's
    local `trigger` would mean a second import silently overwrote the
    first architecture's components. Edges get their ID from React
    Flow's own `addEdge` against an empty list — which is exactly how
    `useLiveblocksFlow`'s `onConnect` names a dragged connection — so
    an imported edge and a hand-drawn one are named alike and **no
    second edge-ID rule was invented**. `getEdgeId` itself is not
    re-exported by `@xyflow/react` and `@xyflow/system` is a transitive
    dependency, so `addEdge` is the supported way to reach it.
  - Every edge is **remapped** through a template-local-ID → runtime-ID
    map built while the nodes are created, so an imported connection
    can only ever point at a node from the same import. `markerEnd` is
    deliberately not copied onto stored edges: an arrowhead is styling,
    owned by `canvasEdgeDefaults` at render.
  - Added `features/canvas/starter-templates-modal.tsx`: the existing
    `EditorDialog` with `contentClassName="sm:max-w-3xl"` — the
    default `sm:max-w-md` would leave the diagrams too narrow to read —
    holding a `sm:grid-cols-2` grid of `Card`s inside a
    `max-h-[60vh]` `ScrollArea`, so the **grid** scrolls and the
    footer does not move off a short screen. It holds **no state**: not
    a highlighted template, not a copy of the library, and not the open
    flag. Each card's import button carries the template's name in an
    `sr-only` accessible name, because three buttons reading "Use
    template" are indistinguishable when listing a dialog's controls.
  - Added `features/canvas/starter-template-preview.tsx`. **One small
    `<svg>` and nothing else** — no React Flow instance, no
    `ReactFlowProvider`, no store, no handles, and no Liveblocks — so a
    modal listing three templates does not mount three canvases behind
    a dialog. Bounds are computed from the template's **own** node
    positions and sizes, fitted into a fixed 320×132 box with padding
    and centred, and **never enlarged past 1:1**, so a small template
    is not blown up to look like a bigger architecture than the one
    beside it.
  - The scale is applied to the **coordinates**, not as an SVG
    `transform`, which is what lets the stroke width be a constant
    hairline: a `transform="scale(…)"` would squash the stroke with the
    geometry and leave it invisible on a wide template and heavy on a
    narrow one. Connections are straight lines between fitted node
    centres in the shared `CANVAS_EDGE_STROKE` and
    `canvasEdgeOpacity.rest`, drawn **beneath** the shapes as the
    canvas draws them; labels, arrowheads, and orthogonal routing are
    dropped deliberately — none survives the scale, and a marker would
    need `<defs>` that React Flow generates from a store this preview
    has none of. The `<svg>` is `aria-hidden`, because the card's name
    and description are its accessible content.
  - Added `hooks/use-starter-templates.ts`, which owns **only** whether
    the picker is open — the library is a module constant, and choosing
    a template imports it and closes the dialog in one click, so there
    is nothing else to hold. It is mounted in `EditorShell` because the
    control that opens the picker is in the navbar, and the flag is
    keyed to a **project** rather than a bare boolean, exactly as
    `useShareDialog`'s is: the hook survives navigation, so a picker
    opened over one project's canvas must not reappear over another's,
    where its next click would replace an architecture the user had not
    been looking at.
  - Added `features/canvas/starter-templates-context.tsx`, mirroring
    `ProjectActionsProvider`. The picker is opened from the navbar and
    imported into by the canvas, which sit on **opposite sides of the
    shell's `children` boundary** — the navbar is the shell's own, the
    canvas arrives as the workspace route's server-rendered child — and
    a context is how `code-standards.md` says to bridge that. It is
    wrapped around `<main>` alone rather than the whole shell, since
    the sidebar, the AI panel, and the project dialogs have no canvas
    to import into. It carries the open flag **only**; the import needs
    the room's nodes and the React Flow instance, so it is created in
    the canvas and stays there.
  - Added `hooks/use-canvas-template-import.ts`. It holds **no canvas
    state**: it is handed the room's current nodes and edges and the
    Liveblocks mutations, and writes through them — the same route a
    drop, a drag, a resize, and a connection take. `initial` is
    unchanged, the room is not remounted, and nothing reaches
    PostgreSQL.
  - **Replacement, not addition, and it had to be `onDelete`.**
    `@liveblocks/react-flow`'s `applyNodeChanges` and
    `applyEdgeChanges` both `break` on a `remove` change (verified in
    the shipped `dist/lib/flow.js`), so a `remove` does **not** delete
    from Storage — the `onDelete` mutation is the only thing that does,
    and it takes the edges out before the nodes so no edge is left
    pointing at a component that has gone. The template then arrives as
    `add` changes, nodes before edges, so no edge is added before its
    endpoints exist. The deletion is skipped on an already-empty
    canvas, so importing into a fresh project writes no deletion of
    nothing into the history frame.
  - **One undo step for the whole import**: `history.pause()` with the
    three mutations in a `try` and `resume()` in a `finally`, so
    clearing and adding commit as a single Liveblocks frame and one
    Undo restores the previous architecture rather than the user
    undoing an import edge by edge through a completely empty canvas.
    The `finally` is what guarantees the resume — a throw would
    otherwise leave history paused for the session, swallowing every
    later change into a frame nothing commits. Unlike the label editor
    this needs **no `hasPausedHistory` ref**: that guard exists because
    a pause held across an asynchronous session can be resumed by the
    wrong owner, while here the pause and the resume are in one
    synchronous block with nothing awaited between them.
  - **The fit is deferred, and guarded rather than timed.** At the
    moment of the write React Flow's store still holds the old canvas,
    so fitting there would frame the architecture just deleted.
    Instead the imported IDs go into a ref and an effect on `nodes`
    fits **once**, when every one of them is present — not on a
    `setTimeout`, and not on a collaborator's unrelated edit landing in
    between. It reuses `canvasFitViewOptions` (`maxZoom: 1`) with
    `CANVAS_VIEWPORT_ANIMATION_DURATION` added, as the control bar's
    button does, and fits **by node ID** so the frame is the imported
    architecture even if somebody else is drawing elsewhere. This is
    safe because `<ReactFlow>` syncs its `nodes` prop into the store
    from an effect in a **child** component, which React runs before
    the parent's, and because the imported nodes carry an explicit
    `width` and `height`, so their bounds are correct before anything
    has been measured. The resulting viewport is client-local — not
    written to Storage or Presence, and no collaborator's view moves.
  - Wired it in: `editor-navbar.tsx` gained an `onOpenTemplates` prop
    and a **Templates** ghost button, scoped to an open project exactly
    as Share is and placed before it — it acts on the canvas, so Share
    stays the one outlined, project-level action; `editor-shell.tsx`
    mounts the hook, passes `starterTemplates.open` to the navbar, and
    provides the controller around `<main>`;
    `architecture-canvas.tsx` consumes the context, creates the import,
    and mounts the modal. The modal sits among `<ReactFlow>`'s children
    and costs the canvas nothing — Radix portals the content to the
    body, so it renders **no DOM inside the flow** and needs no
    `nodrag nopan nowheel`, unlike the two real overlays — and it is
    therefore mounted for exactly as long as the canvas is.
  - `/editor/[projectId]` is still a Server Component and **project
    fetching did not move to the client.** `useLiveblocksFlow` and its
    four handlers, `onDelete`, `ConnectionMode.Loose`,
    `defaultEdgeOptions`, `colorMode="dark"`, both custom type maps,
    and the drag-and-drop handlers are what unit 17 left. Node
    rendering, edge rendering, the component panel, and node and edge
    editing are untouched, apart from the two mechanical refactors
    named above.
  - Out of scope and deliberately absent: template saving,
    user-created templates, template editing, detailed Design Studio
    process or Business Object templates, server persistence for
    template definitions, AI-generated templates, and template
    categories or search. A `design-studio-process` and a
    `business-object` are **one component each**, exactly as they are
    in the toolbar, because their internals belong to the detailed
    canvases they will each open later and inventing them here would
    mean inventing product behaviour (invariant 7).
  - **No dependency was installed.** `addEdge`, `useReactFlow`, and the
    React Flow types are already present, `useHistory` is the entry
    point the label editors use, and `lucide-react` supplies
    `LayoutTemplate` — verified against the package's own barrel
    `.d.ts` rather than assumed.
  - Verified: `npx next typegen`, `npx tsc --noEmit`, `npm run lint`,
    and `npm run build` all pass with no errors and no warnings,
    reporting the same **eleven** routes plus `ƒ Proxy (Middleware)` —
    this unit adds components, hooks, and data, not routes.
  - **Not opened in a browser, and a build cannot speak to most of this
    unit.** Unverified: that the three previews are legible at card
    width and that the shapes are recognisable at that scale; that the
    template layouts read as sensible architectures once on a real
    canvas rather than as coordinates; that an import genuinely
    replaces the canvas in Storage and reaches a second client; that
    **one** Undo restores the previous architecture rather than several
    — which needs a room, since it is a Liveblocks frame and not a
    local count; that the fit frames the imported architecture instead
    of firing early or not at all; and that the Templates button
    reads correctly beside Share at narrow widths. The undo behaviour
    is the one to check first, because it is the only claim here that
    a reader cannot confirm from the code alone.
  - Updated `context/ui-context.md` (a **Starter templates** section,
    and the navbar section now naming the templates entry point and the
    ghost-versus-outline weighting of the three project actions).

- Unit 19 — Presence avatars and live cursors (2026-08-21):
  - Added `features/collaboration/presence-tokens.ts`: the two
    dimensions the participant group is built from —
    `MAX_VISIBLE_COLLABORATOR_AVATARS` (5) and
    `PRESENCE_AVATAR_SIZE` (`1.75rem`). They are shared because the
    avatar stack and the group around it must agree on both, which is
    the same reason `features/canvas/canvas-*-tokens.ts` exist. Nothing
    in it is a colour: a collaborator's colour is *data* from their
    Liveblocks session, and the group's surface is Tailwind classes
    against the palette.
  - Added `features/collaboration/collaborator-avatar-stack.tsx`: the
    other people in the room as an overlapping `AvatarGroup`.
    **`useOthers`, so the current user cannot be rendered twice** —
    Liveblocks reports `self` separately, so no filtering by ID is
    needed to keep them out. The selector returns **connection IDs
    only**, compared with `shallow`, and each avatar then subscribes to
    its own collaborator through `useOther`: presence updates as often
    as a cursor moves, so a plain `useOthers()` would re-render the
    whole stack many times a second, and a list of IDs changes only
    when somebody joins or leaves. It renders **nothing at all** when
    the room holds one person, which is what takes the divider with it.
  - Each collaborator is the existing `Avatar` primitive with the Clerk
    image when there is one and **two-letter initials** (first and last
    word of the display name) otherwise, ringed 2px in that person's
    own cursor colour — the same hue as their cursor, which both
    separates overlapping circles and keeps a dark profile picture from
    dissolving into the canvas. Five faces at most; the remainder is an
    `AvatarGroupCount` `+N` chip, left the primitive's muted circle
    because it names no individual and so takes no collaborator colour.
  - Identity comes from the session's own **`other.info`** — the name,
    avatar, and colour `POST /api/liveblocks-auth` already attaches
    server-side — so nothing read from presence is untrusted input.
    `useUser` is deliberately **not** used: it resolves through a
    `resolveUsers` callback on `LiveblocksProvider` that this
    application does not have.
  - Added `features/collaboration/canvas-participants.tsx`: the
    top-right floating pill on the same
    bordered-pill-on-`--card`-with-a-backdrop-blur surface as the
    component toolbar and the control bar, at `z-20` — above React
    Flow's own `z-index: 5` panels, below the two `z-40` side panels.
    It holds the stack, the inset rule, and the current user's
    `UserButton`, sized from the shared token so both halves match.
  - **The `UserButton` moved rather than being duplicated.**
    `editor-navbar.tsx` now renders it only when `projectName` is
    `null`; with a project open the same button lives in the
    participant group. That is what satisfies the spec's "current user
    is shown once" — the literal alternative, leaving the navbar button
    in place and adding a second one, would show the same person twice
    a few pixels apart. Templates, Share, and the AI toggle are
    untouched, the editor home is unchanged, and Clerk's profile and
    sign-out flows are exactly as built.
  - The group is mounted inside `RoomProvider` but **outside**
    `CanvasConnectionBoundary` and the canvas' `ClientSideSuspense`,
    under a new `relative h-full w-full` wrapper in
    `canvas-room.tsx`. While a project is open this is the only account
    menu on screen, so it has to survive the states the canvas does not
    render in — connecting, and permanently failed. Only the
    collaborator stack waits for presence, behind its own
    `ClientSideSuspense fallback={null}`: a skeleton avatar would imply
    somebody is there before the room can say whether anybody is.
    Being inside the room is also what scopes presence to an open
    project canvas and nowhere else.
  - Two specificity exceptions, both forced rather than chosen. The
    avatar diameter is an inline `width`/`height` because Clerk's own
    rule for `userButtonAvatarBox` is **unlayered** while Tailwind's
    utilities sit in a layer, so a size class would silently lose; our
    avatars take the same inline value so one number sizes both halves.
    The colour ring is an inline `boxShadow` because `AvatarGroup` sets
    `ring-2 ring-background` on its children through a variant whose
    selector outranks a plain class on the child.
  - Added `features/collaboration/collaborator-cursors.tsx`: live
    cursors as **`@liveblocks/react-flow`'s own `Cursors`**, mounted
    among `<ReactFlow>`'s children before the two overlay pills so
    cursors paint under them. Its source was read before choosing it,
    and it does exactly what the spec asks: it writes the **existing
    `cursor` presence key** (its own default) as a partial update, so
    `isThinking` is untouched and **`liveblocks.config.ts` did not
    change**; the value is **React Flow coordinates** through
    `screenToFlowPosition` on the same flow instance the drop handler
    uses; it clears `cursor` to `null` on pointer leave, on window
    blur, and on unmount; it renders **only others**, from the room's
    other connection IDs, so the current user's own cursor is never
    drawn; it converts each stored point back with **this viewer's**
    pan and zoom and subscribes to that transform, so two people at
    different zoom levels see the pointer over the same component; and
    it skips broadcasting while the pane is being dragged. Writing a
    second implementation of any of that would have been a second
    version of behaviour already in the tree.
  - Only the **appearance** is ours, passed as `components.Cursor`: a
    plain arrow filled with the collaborator's colour and stroked in
    `var(--background)`, which is what keeps it visible over an amber
    or red node, with a name badge of the same colour carrying
    `text-background` type — the eight cursor colours are all light
    saturated hues, so dark text is what stays legible on them. The
    name is **always shown**, because eight colours means two people in
    a busy room can share one. The badge hangs off the arrow's tail so
    it does not cover the point being indicated.
  - `@liveblocks/react-flow/styles.css` is imported by that component
    alone, colocated as the canvas imports React Flow's `base.css`. It
    is **one rule** — the layer's `position`, `inset`, `overflow`,
    `pointer-events: none`, and a `z-index: 5` matching React Flow's
    panel layer — so a cursor near the edge cannot paint over the
    navbar and nobody else's pointer can intercept a click.
    `@liveblocks/react-ui/styles.css` is deliberately not imported.
  - **Cursor movement is presence and nothing else.** Nothing about it
    reaches Liveblocks Storage or PostgreSQL, so it is not part of the
    document, and **cursor coordinates are the only collaborative
    presence data** — zoom, pan, viewport, hover, and selection remain
    client-local, as unit 17 left them. No cursor trail.
  - Untouched, deliberately: `liveblocks.config.ts`, `Storage.flow`,
    `useLiveblocksFlow` and its four handlers, both custom renderers,
    connection handling, node and edge editing, colours, drag and drop,
    starter templates, the editor home, the project sidebar, and the
    share dialog. `isThinking` still has no behaviour. Collaborator
    avatars are **display-only** — not buttons, no menu, nothing on
    click — and there is no participant menu, no comments, and no
    notifications.
  - **No dependency was installed.** `@liveblocks/react-flow` and
    `@liveblocks/react-ui` were already here for `useLiveblocksFlow`,
    and `Cursors`, `CursorsCursorProps`, `useOther`, `useOthers`, and
    `shallow` are all existing exports — checked against the packages'
    own `.d.ts` rather than assumed.
  - Verified: `npx next typegen`, `npx tsc --noEmit`, `npm run lint`,
    and `npm run build` all pass with no errors and no warnings,
    reporting the same **eleven** routes plus `ƒ Proxy (Middleware)` —
    this unit adds components and tokens, not routes.
  - **Not opened in a browser, and never seen with two sessions in one
    room — which is most of what this unit is.** Unverified: that a
    second participant's avatar and cursor actually appear; that the
    ring colour and the cursor colour visibly match for the same
    person; that a remote cursor lands over the right component when
    the two clients are at different zoom and pan, which is the claim
    to check first because it is the one a reader cannot confirm from
    the code; that `cursor` really clears when the pointer leaves;
    that the `+N` chip is reached only past five; that the `UserButton`
    sizes to `1.75rem` against Clerk's own stylesheet and reads as an
    equal beside our avatars; and that the account menu is still
    reachable on the canvas' loading and error states.
  - Updated `context/ui-context.md` (new **Participant presence** and
    **Live cursors** sections, and the navbar section now recording
    that the right-hand side ends in the project actions *or* the user
    menu, never both) and `context/architecture.md` (identity read from
    `other.info` rather than `useUser`, presence subscribed by
    connection ID, the participant group's mounting position, the
    single-`UserButton` rule, and the cursor bullets — `Cursors` owning
    both halves, the existing `cursor` key, flow coordinates, clearing
    to `null`, and presence-only storage).

- Unit 20 — AI sidebar shell (2026-08-21):
  - Rewrote `components/editor/ai-sidebar.tsx` as the **shell only**:
    the placement, the slide, the header, and the tab group. Every
    mechanic the placeholder had is unchanged — `EditorShell` still owns
    `isOpen` and `onClose`, the panel is still mounted only with a
    project open, the navbar's `Sparkles` toggle still opens it, and the
    `<aside>` keeps its `absolute inset-y-0 right-0 z-40 flex w-80`
    overlay, its `bg-card` surface, its `border-l border-border`, its
    `translate-x-full`→`translate-x-0` slide over 200ms, and `inert`
    plus `aria-hidden` while closed. The last of those matters more than
    it did: the panel now contains a focusable text field, so a closed
    panel would otherwise put a textarea in the tab order behind the
    canvas.
  - The header is a `Bot` icon in a `size-8 rounded-lg bg-brand-surface`
    square, the title `AI Workspace`, the subtitle
    `Design your automation solution` in `text-xs text-muted-foreground`,
    and the existing close button. The square is the **auth brand
    panel's own treatment** — `bg-brand-surface` with a `text-primary`
    icon — so marking this as an AI surface needed **no new token**.
  - The tabs are the generated `Tabs` primitive with **nothing
    restyled**: its active trigger already takes the accent surface and
    `--foreground` while the inactive one stays `--muted-foreground`, so
    `AI Architect` and `Specs` read exactly as the project sidebar's two
    tabs do. Anything else would have been a restyle of a generated file
    for a look the primitive already has.
  - Added `features/ai-workspace/`, a new feature module, because the
    panel's contents are not editor chrome: the shell owns where the
    panel is and whether it is open, and this owns what is in it.
  - `ai-architect-panel.tsx` is a `ScrollArea` conversation above the
    composer. Its empty state is the same tinted bot square, a muted
    line saying the AI Architect will help design this project's IA
    solution, and the three starter-prompt chips from
    `ai-architect-prompts.ts` — `Design a WorkHQ workflow`,
    `Design a Design Studio process`, `Review this solution
    architecture`.
  - **The chips are `disabled`**, which is the spec's "UI suggestions
    only" read through the convention this interface already has: an
    action whose behaviour is not implemented is rendered visibly not
    ready rather than wired to a no-op. Filling the composer from a chip
    was considered and rejected — it is behaviour the specification does
    not describe. If they should insert their text instead, that is a
    one-line change in the panel, not a restructure.
  - The empty state **replaces** the `ScrollArea` rather than sitting
    inside it. Radix wraps a viewport's children in a `display: table`
    element, so a percentage height does not resolve in there and a
    centred column would have collapsed to its own height at the top of
    the panel. The project sidebar does not hit this because its scroll
    areas hold only a list.
  - `ai-chat-composer.tsx` is the input: a `Textarea` auto-sizing
    between **72px and 160px** and then scrolling, `Enter` to submit,
    `Shift+Enter` for a newline, and a send button disabled on a blank
    draft. The sizing is the primitive's **own `field-sizing-content`**
    bounded by `min-h-18 max-h-40` — no measured height, no ref, and no
    resize observer — with `resize-none` so the native grip is not a
    second mechanism sizing the same box. An `Enter` closing an IME
    candidate list is ignored via `isComposing`, so a composed language
    can be typed.
  - `ai-chat-message.tsx` draws a turn: a user message right-aligned in
    a `rounded-xl` bubble on `--primary` with `--primary-foreground`
    text, an assistant message left-aligned on `--popover` with a
    `--border` edge and `--foreground` text. **The assistant branch is
    unreachable today** and deliberately so — the spec asks for it to be
    prepared, so both sides of a conversation are described in one place
    rather than one arriving later beside the other.
  - **Submitting calls nothing.** It appends the trimmed draft to a
    local list as a `user` message and clears the field: no provider, no
    route handler, no Vercel AI SDK, no Gemini, no streaming, and no
    reply. Nothing is written to Liveblocks Storage, to Presence, or to
    PostgreSQL, so the conversation is lost when the panel unmounts,
    which is what this unit asks for.
  - Added `hooks/use-ai-architect-chat.ts` and mounted it in
    `AiSidebar` rather than in the tab that shows it, because
    **Radix `Tabs` unmounts the inactive panel** (a fact already
    recorded in Session Notes): state held inside `AI Architect` would
    have been discarded every time somebody looked at `Specs`, losing
    both the messages and a half-typed draft. This is the "keep shared
    state in one hook and pass it down" rule, and it keeps the state
    "local to the sidebar" in the literal sense the spec asks for.
  - A message ID is a **per-mount counter**, not `Date.now()` and not a
    random value. It is only a React key for a list in one browser, so
    unlike a canvas node ID — a key in a `LiveMap` two clients write to
    — there is no second writer to collide with, and a counter is also
    identical on the server.
  - `ai-specs-panel.tsx` is a full-width `Generate Spec` button over the
    specifications list, holding one static example card:
    `Solution Architecture Specification`, a `FileText` icon, a short
    description of an automation solution design, and a `Download`
    action. **`Generate Spec` and the download are both `disabled`** —
    same convention as the chips — so nothing is generated, stored,
    downloaded, or written to blob storage. The card sits on
    `bg-popover`, the elevated surface, because the panel around it is
    already `--card` and the `Card` primitive's own ring alone would
    leave it reading as part of the panel.
  - `components/editor/editor-navbar.tsx` changed by **one string**: the
    AI toggle's `aria-label` is now `Open`/`Close AI workspace`, so the
    accessible name matches the panel's visible title. Its behaviour,
    its icon, its `aria-expanded`, and every other control in the bar
    are untouched.
  - Untouched, deliberately: `liveblocks.config.ts`, `Storage.flow`,
    `useLiveblocksFlow`, both custom renderers, the component toolbar,
    the control bar, starter templates, the participant group, live
    cursors, the project sidebar, the share dialog, the `UserButton`,
    and `EditorShell`'s own state beyond nothing at all. **`isThinking`
    is still written by nothing** — AI activity and a collaborative
    thinking state are a later unit, per the spec.
  - **No token, no primitive, and no dependency was added.** The header
    square reuses `--brand-surface`; `Button`, `Textarea`,
    `ScrollArea`, `Tabs`, and `Card` were all already generated, and
    none was modified.
  - Verified: `npx next typegen`, `npx tsc --noEmit`, `npm run lint`,
    and `npm run build` all pass with no errors and no warnings,
    reporting the same **eleven** routes plus `ƒ Proxy (Middleware)` —
    this unit adds components, not routes.
  - **Not opened in a browser.** Unverified: that the textarea really
    stops growing at 160px and scrolls rather than pushing the send
    button out of the panel at `w-80`; that the empty state, the three
    chips, and the spec card all fit that width without wrapping badly;
    that `Enter` submits while `Shift+Enter` does not, and that neither
    reaches the canvas keyboard shortcuts — `use-keyboard-shortcuts.ts`
    already ignores an event inside a `textarea`, so this should hold,
    and it is the first thing to check because it is the only way this
    unit could break something that already worked; that the two tab
    triggers are legible side by side at that width; and that a
    submitted message survives a switch to `Specs` and back, which is
    what the hoisted hook exists for.
  - Updated `context/ui-context.md` (the **AI design assistant panel**
    section is now **AI workspace panel**, describing the header, the
    tabs, the empty state, both message treatments, the input bounds,
    and the specs card) and `context/architecture.md` (the new
    `features/ai-workspace/` boundary, and — under Background and AI
    Model — that the AI workspace UI exists ahead of the provider, that
    a provider belongs behind a `lib/` service module rather than in
    these components, and that `isThinking` is still written by
    nothing).

- Unit 21 — Canvas snapshot persistence (2026-08-21):
  - Installed **`@vercel/blob` 2.8.0**, the unit's one dependency. It
    was not already present.
  - Added `lib/blob.ts`, the Vercel Blob adapter and the **only module
    that calls the Blob SDK**, per `architecture.md`'s rule that
    storage is isolated behind a small service module.
    `uploadJsonBlob(pathname, json)` stringifies, uploads with
    `contentType: "application/json"`, and returns the URL. It reads
    `BLOB_READ_WRITE_TOKEN` **at call time** and throws
    `BlobNotConfiguredError` when it is absent — the same
    lazy-credential pattern as `lib/liveblocks.ts`, which is what lets
    `npm run build` load the route without any runtime environment.
    The token is never passed to `put`; the SDK reads the same variable
    itself.
  - Blobs are written with **`access: "private"`**, isolated as one
    `BLOB_ACCESS` constant. The pathname is deterministic and therefore
    guessable, so a public blob would make an access-controlled
    project's canvas readable by anyone who knew a project ID.
  - `addRandomSuffix: false` with `allowOverwrite: true`, so each
    capture **replaces** the project's snapshot file. One file per
    project rather than an accumulation nothing would ever delete, and
    a `canvasJsonPath` that stays valid across later snapshots.
  - Added `features/canvas/canvas-snapshot.ts`, the format:
    `CANVAS_SNAPSHOT_VERSION = 1`, the `CanvasSnapshot` interface
    (`version`, `projectId`, `capturedAt` as ISO-8601, `storage`),
    `createCanvasSnapshot`, and `canvasSnapshotPathname` →
    `projects/<projectId>/canvas.json`. `storage` is the Liveblocks
    tree **verbatim**, so the snapshot holds no second model of a node
    or an edge. It is type-and-format only and touches no provider, so
    it is safe on either side of the network boundary. Versioned from
    the first snapshot, because a reader added later has to be able to
    tell what it is holding.
  - Added `ProjectRoomStorageJson = ToJson<Liveblocks["Storage"]>` to
    `liveblocks.config.ts`, named there for the same reason
    `ProjectUserInfo` is: importing the `Liveblocks` **class** from
    `@liveblocks/node` shadows the global interface inside the server
    adapter. `ToJson` is re-exported by `@liveblocks/client`, a direct
    dependency, so nothing reaches into transitive `@liveblocks/core`.
  - Added `getProjectRoomStorageJson` to `lib/liveblocks.ts`, which is
    `getStorageDocument(projectId, "json")`. **This is the snapshot
    source.** `"json"` rather than the default plain-LSON because no
    later reader needs to know which nodes were `LiveMap`s.
  - Added `recordProjectCanvasSnapshot` to
    `features/projects/project-service.ts`, writing
    **`Project.canvasJsonPath`** and nothing else — the existing field,
    with no second canvas URL added. It is deliberately **not**
    owner-scoped, unlike the rename and the delete: a collaborator
    editing the canvas snapshots it too, and access is already resolved
    by the route (invariant 6). An `updateMany`, so a project deleted
    between that check and this write is a zero-row result rather than
    a throw.
  - Added `features/canvas/canvas-snapshot-service.ts`, where the three
    stores meet: read the room, upload the file, record the reference —
    **in that order**, so `canvasJsonPath` never points at a file that
    does not exist. Nothing is retried or compensated; a snapshot is
    secondary, so a failure loses nothing. It returns
    `captured | missing`.
  - Added **`PUT /api/projects/[projectId]/canvas`**, which takes **no
    request body at all**. It resolves access with the existing
    `resolveProjectAccess` — `401` unauthenticated, `404` for a missing
    *or* inaccessible project — and allows an **owner or a
    collaborator**. `BlobNotConfiguredError` and
    `LiveblocksNotConfiguredError` each answer through
    `configurationErrorResponse` with their own message; anything else
    is rethrown.
  - It passes **`access.project.id`**, the value the database returned,
    rather than the URL segment, because that value is interpolated
    into a Blob pathname.
  - The response is **`{ capturedAt }`** and nothing more. The Blob URL
    is not returned: the client has no use for it, and it addresses a
    private file the server reads on the caller's behalf.
  - Added `features/canvas/canvas-snapshot-client.ts` —
    `saveCanvasSnapshot(projectId)` returning a plain `boolean`. No
    third copy of the other clients' `readErrorMessage`, because the
    indicator renders only three fixed strings and has nowhere to put a
    server message. A network error is caught, so an autosave cannot
    surface as an unhandled rejection in an effect.
  - Added `hooks/use-canvas-snapshot.ts`, mounted inside
    `CollaborativeFlow` because that is where the collaborative arrays
    exist. It debounces **1500ms**, long enough to absorb a drag, a
    burst of typing, or a template import as one snapshot.
  - **Change is detected from a signature, not from array identity.**
    `JSON.stringify` over document fields only — a node's ID, type,
    position, size, and `data`; an edge's ID, endpoints, handles, type,
    and `data` — deliberately excluding `selected`, `dragging`, and
    `measured`, so a selection click costs no snapshot. Depending on
    the arrays would have been an **infinite loop**: `saving` → `saved`
    re-renders, React Flow hands back fresh identities, and the effect
    fires again forever. The nested-array `JSON.stringify` also means a
    node label — arbitrary user text — cannot be mistaken for a field
    separator.
  - **Nothing is snapshotted on mount.** The hook records a baseline
    `{ projectId, signature }` in a ref on first sight of a canvas, and
    the `projectId` half means navigating between two projects behaves
    like a first mount rather than like an enormous edit. The baseline
    moves when a request **starts**, not when it succeeds, so a failure
    is not retried until the canvas changes again; a request-sequence
    ref discards a slow response that lands after a later one.
  - Added `features/canvas/canvas-snapshot-status.tsx`, a React Flow
    `Panel position="top-left"` carrying `nodrag nopan nowheel` —
    `Saving…`, `Saved`, `Save failed`, and **nothing at all** while
    `idle`. Same bordered `--card` pill as every other canvas overlay,
    with quieter contents: `text-xs` muted, a `size-3.5` icon, and a
    failure marked by a warning triangle rather than a red surface.
    `role="status"` with `aria-live="polite"`. **No Save button was
    added.**
  - **Top-left, not the workspace top bar.** `ui-context.md` had save
    status in the navbar and that is not reachable: the status is
    derived from the room's nodes and edges, and the navbar is rendered
    by `EditorShell` above and outside `RoomProvider`. Top-left is also
    the only free corner — presence is top-right, the control bar
    bottom-left, the component toolbar bottom-centre.
  - `features/collaboration/architecture-canvas.tsx` now takes a
    `projectId` prop and threads it to `CollaborativeFlow`;
    `canvas-room.tsx` passes the same ID it joined the room with, so
    the canvas cannot snapshot a different project from the room it is
    in.
  - Untouched, deliberately: `useLiveblocksFlow` and every node and
    edge mutation, `Storage.flow`, the Liveblocks room ID, starter
    templates, presence and cursors, the AI sidebar, and the Prisma
    schema — `canvasJsonPath` already existed. **Nothing loads a
    snapshot back into a room**: not on startup, not over an empty
    canvas, not at all. An empty Liveblocks canvas is valid state, and
    snapshot recovery is a later unit.
  - **No environment file was created, modified, inspected, or
    printed.** `BLOB_READ_WRITE_TOKEN` must be configured separately;
    without it the route answers a configuration error and the
    indicator shows `Save failed`, while the canvas itself keeps
    working normally in the room.
  - Verified: `npx next typegen`, `npx tsc --noEmit`, `npm run lint`,
    and `npm run build` all pass with no errors and no warnings,
    reporting **twelve** routes — the eleven from Unit 20 plus
    `ƒ /api/projects/[projectId]/canvas` — plus
    `ƒ Proxy (Middleware)`.
  - **Not opened in a browser, and no snapshot has ever been written**
    (no Blob credential is configured in this environment). Unverified:
    that a real capture succeeds end to end and that
    `access: "private"` is supported by the store this deploys against
    — a store without private blobs would make **every** snapshot fail,
    visibly as `Save failed`, and the fix is the one `BLOB_ACCESS`
    constant; that the first edit produces exactly one request rather
    than one per change, and that opening a project produces none; that
    a selection or a pan produces none; that a two-session edit leaves
    the last writer's snapshot in place; and that the top-left pill
    clears the project sidebar when it is open.
  - Updated `context/architecture.md` (the **Liveblocks Storage is the
    only home for canvas state** claim is now "the only *writable*
    home", the Stack and Storage Model rows cover snapshots and the
    server-side Blob rules, `lib/blob.ts` and the widened
    `features/canvas/` are in System Boundaries, and there is a new
    **Canvas snapshots** subsection) and `context/ui-context.md` (save
    status has left the workspace top-bar list, and there is a new
    **Canvas snapshot status** section).

- Opening a project from the sidebar (audit fix, 2026-08-10):
  - `features/projects/project-list-item.tsx` rendered the
    project name as a plain `<span>`, so **nothing in the
    application could open an existing project.** Create
    navigated to `/editor/[projectId]` and the route carried a
    working access check, but the only way back to a project
    was to retype its URL — while the editor home told the
    user to "choose a project from the sidebar" and the
    `Shared` tab had no create path at all, so a collaborator
    could never reach a project by any route.
  - The name is now a `next/link` to `/editor/${project.id}`.
    It addresses the project by ID alone, so opening one still
    derives nothing from its name. The row for the open
    workspace is marked `aria-current="page"` and takes
    `--foreground` while the others take
    `--muted-foreground`, which needs no new token and no
    second surface colour. The rename and delete buttons are
    unchanged and remain owner-only.
  - **Browser-verified 2026-08-11.** The link opens the
    workspace, the open row carries `aria-current="page"` for
    both an owner and a collaborator, and a collaborator's
    `Shared` rows expose no rename or delete control.
  - `useParams()` supplies the active ID, the same mechanism
    `use-project-actions.ts` already uses for its
    delete-the-open-workspace redirect, so there is one
    source for "which project is open".
  - This is a UI affordance only: `/editor/[projectId]` still
    runs `findAccessibleProject` and answers `notFound()` for
    a project that is missing or inaccessible, so the link
    grants nothing (invariant 6).
  - Verified: `npx tsc --noEmit`, `npm run lint`, and
    `npm run build` pass with the same eight routes. Since
    driven through a signed-in Chrome session as well — see
    **Verified End to End** (2026-08-11).

## Verified End to End

### Units 01–09 against the real database (2026-08-11)

**The project database served the application for the first
time.** `DATABASE_URL` is now the `prisma+postgres://`
Accelerate URL, which travels over 443 and so is unaffected by
the 5432 filtering described below. `migrate deploy` applied the
committed migration, `migrate status` reported "Database schema
is up to date!", and `migrate diff` returned "This is an empty
migration" — **zero drift**. This exercised the `accelerateUrl`
branch of `lib/prisma.ts` rather than the `PrismaPg` one.

Liveblocks remains stubbed (no account key — see
**In Progress**), so that substitution still stands.

All nine units were re-driven through Chrome over CDP against
this database. **237 checks passed across three parts — 51 for
units 01–03, 57 for 04–07, 129 for 08–09 — with no application
defect found.** Units 01–07 reproduced their
earlier results; what units 08 and 09 added, all through the
actual UI in two concurrent signed-in sessions:

- **The workspace shell.** The navbar names the project, the
  canvas placeholder fills the region below the 56px navbar
  exactly, and it sits on `--background` while the panels take
  `--card`. Neither the project sidebar nor the AI panel
  reflows the canvas — `main`'s width was byte-identical open
  and closed — and the AI panel is `inert` and `aria-hidden`
  while closed, so its controls stay out of the tab order. It
  opens from the navbar and closes from either control.
- **`AccessDenied` reveals nothing.** Another user's project
  and a non-existent ID render **byte-identical** text, the URL
  is not redirected away from, and the refused project's name
  appears nowhere in the served HTML — not just nowhere
  on screen. The navbar drops its name, Share, and AI toggle,
  so the chrome cannot imply access the server refused. A
  malformed, non-UUID ID does not 500.
- **Scope held.** All 16 scripts served to the browser (920KB)
  were fetched and searched: **no `liveblocks`, `reactflow`,
  `react-flow`, or `@xyflow` code ships.**
- **Sharing, end to end.** An invite answered `201` and the row
  appeared immediately carrying the invitee's **Clerk display
  name over their email and their Clerk-hosted avatar**, which
  actually loaded. An address with no Clerk account fell back
  to the email as its label with no blank name line. A re-invite
  differing only in case was `409` and added no row; an owner
  inviting themselves was `409`. A removal answered `204`, the
  row disappeared, and the change persisted — the reopened
  dialog re-fetched rather than showing a stale list.
- **`Copied!` behaves.** The copied text is exactly
  `<origin>/editor/<projectId>` — no project name in it — the
  dialog stays open so the feedback is visible where it
  happened, and the label reverts to `Copy link` after ~2s.
- **A collaborator is read-only in fact, not just in
  appearance.** Their dialog contains **zero `<input>`
  elements** and zero remove buttons, and the server refused
  their forged `POST` and `DELETE` with `403` while answering
  their `GET` `200` with `canManage: false`. A stranger's
  collaborator list answered `404`, not `403`, so existence is
  not revealed.
- Signed out, `/editor/[projectId]` redirected to `/sign-in`
  with no project name in the HTML, and all three collaborator
  verbs answered `401`.
- No uncaught page exceptions and **no unanswered
  app-origin request** in either session. Requests that
  reported `ERR_ABORTED` had all already been answered `200` or
  `204` — the normal shape of a superseded RSC prefetch, not a
  failure.

### Units 01–07 against a substitute database (2026-08-06)

Two substitutions were needed, neither of which changes what
the application executed:

- **Database:** the project database was unreachable
  (`P1001`), so the migration was applied
  to a local `prisma dev` Postgres 17.5 server and the
  application was pointed at it for the run. `migrate deploy`
  applied cleanly, `migrate status` reported "Database schema
  is up to date", and `migrate diff` against the live database
  returned "This is an empty migration" — **zero drift**, so
  the committed migration reproduces the schema exactly. This
  exercised the `PrismaPg` adapter branch of `lib/prisma.ts`.
- **Liveblocks:** no account key is configured, so
  `LIVEBLOCKS_BASE_URL` pointed the **real** `@liveblocks/node`
  adapter at a local stub, and every request it sent was
  inspected. Rooms were created with the project ID verbatim,
  `defaultAccesses: []`, and the owner granted `room:write`,
  with **no project name anywhere in the body**.

What the run confirmed, all through the actual UI:

- **Create** wrote exactly one row, navigated to
  `/editor/[projectId]`, and the route segment, the database
  ID, and the Liveblocks room ID were **the same v7 UUID**. The
  workspace page then resolved the project and rendered its
  name. Status defaulted to `DRAFT`.
- **Rename** updated the stored name and left the ID, the URL,
  and the room untouched — the room list was byte-identical
  before and after.
- **Delete** of the open workspace removed the row, removed the
  room, and redirected to `/editor`; the sidebar returned to its
  empty state.
- **`router.refresh()` is the whole refresh mechanism.** The
  sidebar repopulated from the database after each mutation, and
  **zero client-side `GET /api/projects`** calls were observed
  for the initial list — it arrives with the server render.
- **Access control at both boundaries.** Another user's
  workspace answered `404`; a non-owner `PATCH` and `DELETE`
  each answered `403` and changed nothing; a missing project
  answered `404`. A **collaborator** (a `ProjectCollaborator`
  row matched by email) saw the project in the `Shared` tab
  with **zero action buttons**, could open the workspace
  (`200`), and was refused rename and delete (`403`) — so the
  owner-only UI affordance is backed by a server check.
- **Validation through the real routes.** Missing, empty, and
  whitespace-only names all stored `Untitled Project`; a
  121-character name, a blank rename, and malformed JSON were
  each `400`, not a crash.
- Signed out, all four verbs answered `401` with a JSON body —
  including with `Accept: text/html` and
  `Sec-Fetch-Dest: document` forged, the headers that make
  `protect()` redirect — while `/editor`, `/`, and
  `/editor/[projectId]` still redirected to
  `/sign-in?redirect_url=…`.
- Responses carried only
  `id, name, description, status, createdAt, updatedAt` —
  `ownerId` and `canvasJsonPath` never crossed the boundary.
- The delete confirm resolves its text and its tinted fill from
  the `--destructive` token (`#ef4444`), and the mobile scrim
  appears at 390px and dismisses the sidebar on tap while being
  absent at 1440px.
- No uncaught page exceptions and no failed application
  requests. The throwaway harness, its probe route, and the
  rows it created were all removed afterwards; **no application
  file was modified.**

## In Progress

- ~~**Apply the migration to the project database.**~~
  **Done 2026-08-11.** `DATABASE_URL` in both `.env` and
  `.env.local` is now the `prisma+postgres://` Accelerate URL,
  which travels over **443** and so sidesteps the 5432
  filtering entirely. `migrate deploy` applied the committed
  migration, `migrate status` reports "Database schema is up to
  date!", and `migrate diff` reports an empty migration — zero
  drift. Units 01–09 were then verified against it. This
  selects the `accelerateUrl` branch of `lib/prisma.ts`; the
  `PrismaPg` branch is now the one no longer exercised.

  Kept for the record, since the constraint still applies to any
  direct `postgres://` connection from this network:
  **the failure mechanism is a transparent proxy, not a dropped
  packet.**
  Hand-rolled probes on 2026-08-10 show 5432 **does** complete
  the TCP connect on `db.prisma.io`, `pooled.db.prisma.io`, and
  even `accelerate.prisma-data.net` — a host that serves no
  Postgres on 5432 at all — and all three then leave the 8-byte
  Postgres `SSLRequest` unanswered. Port 54329 on the same host
  gives `ETIMEDOUT` and an unresolvable host gives `ENOTFOUND`,
  so the proxy answers the connect for 5432 specifically and
  then swallows the protocol. An earlier note in this file said
  5432 "never completes the TCP connect"; that was measured
  before the proxy behaviour changed and is superseded. Port
  443 on `db.prisma.io` completes a real TLS handshake
  presenting a `db.prisma.io` certificate, which is why the
  Accelerate path works and the direct one does not. A
  `postgres://` URL — including `pooled.db.prisma.io`, tested
  and failing identically — cannot be used from this network;
  it would need one permitting outbound 5432.
- **A local `prisma dev` server named `default` may still be
  running** with the schema applied (TCP 51214 as of unit 08).
  It is no longer needed now that the real database is
  reachable, and nothing in it is project data.
- ~~**Set a real `LIVEBLOCKS_SECRET_KEY`.**~~ **The key is now
  set (confirmed 2026-08-13, unit 12).** `.env.local` holds an
  `sk_dev_` key, which supersedes every earlier note in this file
  saying the key was absent from both `.env` and `.env.local` —
  those were true when written and are now stale. The key's
  presence was confirmed by its prefix and length only; no secret
  value was read, printed, or copied anywhere, and no environment
  file was created or modified (`ai-workflow-rules.md` protects
  them).

  What this unblocks, and what is still unverified: the code
  paths that depend on the key can now run for the first time —
  the room create inside `POST /api/projects`, the token mint in
  `POST /api/liveblocks-auth`, and a browser actually joining a
  room and loading `Storage.flow`. **None of that has been
  exercised in a browser yet.** So the following remain
  unverified rather than blocked: that Liveblocks accepts our
  room-create and authorize requests, that two browsers sync,
  that the initial `flow` write happens, and — new in unit 12 —
  that a dropped component appears for the other person in the
  room. Verifying them needs `npm run dev` and two signed-in
  browsers, which is a manual step nothing here can substitute
  for. Do not record them as verified from a passing build.

  **Unit 13 adds nothing to this list**, and that is the point: the
  drag preview and the selected outline are both entirely local to
  one browser, so neither depends on the key or on a second
  session. They are unverified for the ordinary reason — nobody has
  looked at them — not because Liveblocks blocks them.

  **Unit 14 does add to it, unlike unit 13.** Resizing and renaming
  both write to Storage, so two of their behaviours cannot be seen in
  one tab at all: that a rename appears live for the other person in
  the room as it is typed, and that a resize does. Two more need a
  room even in a single browser, because they are properties of the
  Liveblocks undo stack rather than of the DOM — that one editing
  session collapses to one undo step rather than one per keystroke,
  and that a resize drag is one step, which this unit relies on the
  integration for instead of implementing. Add to those the ordinary
  never-been-looked-at ones: whether the handles can be grabbed at a
  low zoom, whether a circle stays circular through a corner drag, and
  whether the textarea stays centred as text wraps inside each of the
  six shapes. **None of it is blocked** — the key has been set since
  2026-08-13 — it simply needs `npm run dev` and, for the first two,
  two signed-in browsers.

  **Unit 15 adds one item needing a second session and several
  needing only a look.** The second session is for whether a recolour
  appears live for the other person in the room; a recolour is one
  `updateNodeData` write, so it takes the route a rename already
  takes, but nobody has watched it arrive. The rest need one browser:
  whether the five surfaces are distinguishable on the dark canvas
  and each label legible on its own, whether the toolbar clears the
  resize handles at a low zoom, and whether `nodrag nopan nowheel`
  really keep the pill's gestures off the canvas. One of them is a
  substitution question rather than a visual one and is the first
  thing to check: the shape's `fill` and `stroke` are SVG
  presentation attributes and now carry `color-mix()` values, so if a
  shape renders unfilled, move them to an inline `style` on the SVG
  element. **None of it is blocked.**

  **Units 16 and 17 add items of two different kinds.** Unit 16's need
  a second session: that a connection appears for the other person as
  it is drawn, and that a label appears as it is typed. Unit 17's need
  only **one** browser, but two of them cannot be seen without a room
  at all, because they are properties of the Liveblocks undo stack
  rather than of the DOM — that the undo and redo buttons enable and
  disable as history fills and empties, and that one drop, move,
  resize, recolour, rename, or connection undoes as **one** step. The
  rest need only a look: whether the control bar clears the component
  toolbar at the widths where the two would otherwise meet, whether a
  200ms zoom reads as smooth, whether fit view frames a populated
  canvas sensibly, and — the first thing to check, since it is the only
  way this unit could break something that already worked — whether
  every shortcut fires while **none** of them reaches a node or edge
  label editor. **None of it is blocked.**

  **Unit 18 adds two kinds again, and one of them is the most
  important item on this list.** Needing a room: that an import
  genuinely replaces the canvas in Storage and reaches a second
  client, and — the first thing to check — that **one** Undo restores
  the previous architecture rather than several. The latter is a
  property of the Liveblocks history frame, not of the DOM, so it is
  the one claim in the unit a reader cannot confirm from the code
  alone; if it turns out to take several, the pause/resume block in
  `hooks/use-canvas-template-import.ts` is what to look at, not the
  template data. Needing only a look: whether the three card previews
  are legible at card width and their shapes recognisable at that
  scale, whether the template layouts read as sensible architectures
  on a real canvas rather than as coordinates, whether the fit fires
  and frames the imported architecture, and whether the Templates
  button reads correctly beside Share at narrow widths. **None of it
  is blocked.**

  **Unit 19 is the first unit that is mostly unverifiable without two
  sessions**, since a presence feature has nothing to show a single
  client: whether a second participant's avatar and cursor appear at
  all, whether the ring colour and the cursor colour visibly match for
  the same person, whether `cursor` really clears when a pointer leaves
  the canvas, and — the first thing to check — whether a remote cursor
  lands over the **same component** when the two clients are at
  different zoom and pan. That last one is the only claim in the unit a
  reader cannot confirm from the code, because it is a property of the
  coordinate round-trip rather than of the DOM; if it is wrong, the
  place to look is `Cursors`' own presence key and transform rather
  than `collaborator-cursors.tsx`, which supplies appearance only.
  Reaching more than five participants also needs five sessions, so the
  `+N` chip is the item most likely to stay unseen. Needing one
  browser: whether the `UserButton` sizes to `1.75rem` against Clerk's
  own unlayered stylesheet and reads as an equal beside our avatars,
  whether the pill clears the navbar and the AI panel at narrow widths,
  and whether the account menu is still reachable on the canvas'
  loading and error states — which is what the mounting position
  outside both boundaries exists for. **None of it is blocked.**

  **Unit 20 adds nothing needing a room or a second session**, which is
  the point of it: the AI workspace is one browser's own panel, and
  nothing in it touches Liveblocks, Presence, or the database. Its items
  need only a look, and the first is the one that could break something
  that already worked: whether `Enter` and `Shift+Enter` in the composer
  stay out of the canvas keyboard shortcuts — `use-keyboard-shortcuts.ts`
  ignores an event inside a `textarea`, so it should hold, but neither
  key was in that hook's original test. Then whether the textarea stops
  growing at 160px and scrolls instead of pushing the send button out of
  a `w-80` panel; whether the empty state, the three chips, and the spec
  card fit that width; whether both tab triggers are legible side by
  side in it; and whether a submitted message survives a switch to
  `Specs` and back, which is what hoisting the chat hook to the sidebar
  exists for. **None of it is blocked.**

  **Unit 21 is the first unit with an item that is genuinely blocked**,
  and it is blocked on a credential rather than on code: no
  `BLOB_READ_WRITE_TOKEN` is configured in this environment, so **no
  snapshot has ever been written** and the whole server chain — the
  Storage read, the upload, the `canvasJsonPath` write — is unexercised.
  Until it is set, the indicator will show `Save failed` on every edit
  while the canvas itself keeps working normally in the room, which is
  the designed behaviour and not a regression. The first thing to check
  once it is set is whether the store supports **`access: "private"`**:
  a store without private blobs makes every snapshot fail identically,
  and the fix is the single `BLOB_ACCESS` constant in `lib/blob.ts`
  rather than anything in the route or the hook.

  Needing one browser and a credential: whether the first edit produces
  **exactly one** request rather than one per change, and whether
  opening a project produces **none** — both are the debounce and the
  skipped initial mount, and both are visible in the network panel;
  whether a selection click, a pan, or a zoom produces none, which is
  what excluding `selected`, `dragging`, and `measured` from the
  signature is for; and whether the stored JSON really carries the
  Storage tree rather than an empty `flow`. Needing two sessions: that
  two people editing at once leave the last writer's snapshot in place
  and neither overwrites the other's canvas — nothing reads a snapshot
  back, so this should be uninteresting, and confirming it is
  uninteresting is the point. Needing only a look: whether the top-left
  pill clears the project sidebar when it is open, and whether `Saving…`
  is on screen long enough to be read at all on a small canvas.

## Next Up

- ~~**Grant a collaborator access to the Liveblocks room.**~~
  **Resolved by unit 10 (2026-08-12).** The open question was
  where the grant belongs, given that a collaborator is
  identified by email while Liveblocks wants a user ID, so an
  invitee who has not signed up yet cannot be granted anything
  at invite time. The answer: **the grant lives entirely in
  `POST /api/liveblocks-auth`, resolved per session from the
  database.** The invite route makes no Liveblocks call, and no
  `usersAccesses` is baked into a room — which also means a
  removed collaborator cannot keep a permission the database no
  longer supports. `createProjectRoom` granting `room:write` to
  the owner alone is now irrelevant to who can enter a room.
  What remains is only the client half: mounting the room
  provider and pointing it at this endpoint, which belongs with
  the canvas.
- **A removed collaborator keeps an open tab working — this is
  now a real gap, not a theoretical one.** Removal deletes the
  row, but a collaborator already inside the workspace holds a
  rendered page; nothing revalidates for them, so their next
  navigation is the first thing the access check sees.
  **Unit 11 made the canvas writable, so the note that used to
  excuse this no longer holds:** that tab is inside the
  Liveblocks room with a `*:write` grant, and its token stays
  valid until it expires. Removal revokes nothing at the
  Liveblocks end — by design, since permissions are resolved per
  session rather than stored on the room, so the *next* auth
  request refuses them — but the current session is not
  interrupted. Two candidate answers: revoke the room's active
  sessions from the removal route, or have the client re-check
  access and leave the room. Decide before the canvas carries
  real customer design data.
- `GET /api/projects` still returns owned projects only. The
  sidebar no longer uses it — the layout calls the services
  directly — so it is now only an unused public surface.
  Decide whether it should return both lists or be removed.
- ~~**The architecture canvas.**~~ **Built by unit 11
  (2026-08-12).** `/editor/[projectId]` now mounts a
  Liveblocks-backed React Flow canvas: the room provider points
  at `POST /api/liveblocks-auth`, `Storage.flow` is typed from
  `types/canvas.ts`, and `useLiveblocksFlow` owns the node and
  edge state. What the canvas still has **none of** is everything
  the specification put out of scope: viewport controls, any
  custom node or edge renderer (so nothing draws a `label`,
  `color`, or `shape` yet), cursor and presence UI — `Presence`
  is typed but still never written — and any way to *add* a
  component, so a real project's canvas is empty until the tools
  exist. **Unit 12 closed two of those (2026-08-13):** the
  component catalogue and the shared token map now exist in
  `features/canvas/`, a `canvasNode` renderer draws each mapped
  shape with its label, and a component can be added by dragging it
  from the bottom toolbar. **Units 16 and 17 closed two more:** a
  `canvasEdge` renderer draws every connection, and unit 17 added the
  viewport controls — zoom, fit view, and Liveblocks undo/redo, with
  keyboard shortcuts. **Unit 19 closed the last of them (2026-08-21):**
  `Presence.cursor` is now written, remote cursors are drawn in flow
  coordinates, and a participant group shows who is in the room. Every
  item on that original list is therefore built. `isThinking` remains
  the one field of `Presence` nothing writes, deliberately — it belongs
  to AI activity, and **unit 20 kept it that way on purpose**: that unit
  built the AI workspace UI and its specification explicitly excluded
  touching `isThinking`, so a collaborative thinking state waits for the
  unit that adds a real model call to have something to report.
- **What the canvas needs next, after unit 14.** Unit 14 closed the
  rename-and-resize gap this item used to describe: a component can be
  renamed by double-clicking its label and resized from its own
  handles, both straight into the collaborative node. **A properties
  panel is still absent, and is now the narrower question it should
  be** — not "how is a component edited at all" but which fields
  belong to a panel rather than to the node itself, since a label is
  edited on the canvas and a size is dragged. The panel has no
  specification yet, and unit 14's put it, component-specific
  configuration fields, and edge editing explicitly out of scope.
  Beyond it: the drill-down canvases that `Process` and
  `Business Object` are meant to open, and a `Tooltip` primitive to
  replace the native `title` on the component toolbar buttons — and now
  on the colour swatches and on the five control-bar buttons, whose
  hints carry the keyboard shortcuts and so are the most worth
  upgrading. Unit 16 supplied the edge renderer, unit 17 the viewport
  controls, and unit 19 the presence avatars and live cursors, so what
  remains of this list is the properties panel, the drill-down
  canvases, and the `Tooltip` primitive — which the participant group's
  own `title` hints on the collaborator avatars have now added a third
  place to.
- **Node colours are now chosen by a person, which leaves the
  category question open rather than answered.** Unit 15 filled the
  token map with five themes and a toolbar to pick them, so this item
  no longer reads "the map has one entry" — but those five are
  **deliberately meaningless**, and nothing derives a colour from a
  component's category. Whether a WorkHQ component should *default*
  to a colour, and what happens to a node somebody has already
  recoloured by hand if it does, has no specification. Decide that
  before attaching any meaning to a colour: today none of the
  application reads one.
- **The AI design assistant itself.** Unit 20 replaced the
  placeholder with a real workspace — an `AI Architect` tab with a
  local conversation and a working composer, and a `Specs` tab —
  but **everything behind it is still absent**: no Vercel AI SDK
  client, no Gemini call, no AI route handler, no structured-output
  schemas, no streaming, and no validation-before-canvas step
  (invariant 4). A submitted message gets no reply, `Generate Spec`
  and the spec download are `disabled`, the starter chips are
  `disabled`, and the conversation is unpersisted client state. This
  is now the largest gap in the product, and the next AI unit should
  say which of those it adds — a provider and a reply, or generation
  onto the canvas — rather than both.
- ~~Save status in the workspace navbar.~~ **Resolved by unit 21
  (2026-08-21), in a different place.** Save status exists, as a
  top-left canvas overlay rather than in the top bar, because it is
  derived from the room's nodes and edges and the navbar is rendered
  above and outside `RoomProvider`. `ui-context.md`'s Main Layout list
  has been corrected accordingly. Moving it into the bar later would
  need a context provider above both the shell and the room, which is a
  restructure rather than a relocation — and the tracker records the
  reason so it is not attempted as a tidy-up.
- Lifecycle state in the workspace navbar, and the right properties
  panel for a selected requirement, component, or finding, per the Main
  Layout section of `ui-context.md`, once their feature specifications
  exist.
- **Snapshot recovery, and everything else that reads a snapshot.**
  Unit 21 writes `projects/<projectId>/canvas.json` and records it in
  `canvasJsonPath`, but **nothing reads it back** — there is no
  recovery, no snapshot history, no manual restore, no export, and no
  standards or AI feature consuming it. The format is versioned from
  the first snapshot precisely so a reader can be added without
  reopening what has already been written. Any such unit has to answer
  the question this one deliberately refused: an empty Liveblocks
  canvas is **valid state**, so a restore can never be automatic, and
  what triggers one — and what it does to a room several people are in
  — needs a specification before a line of it is written.

## Open Questions

- None.

## Architecture Decisions

- **Dark-only theme.** The palette is defined once in
  `:root` with `color-scheme: dark` rather than split
  across `:root` and `.dark`. The `dark` class is still
  applied to `<html>` so the `dark:` variants baked into
  the generated primitives resolve against the same
  palette. This satisfies "no default light styling
  appears" without editing `components/ui/*`.
- **shadcn Nova preset with the Radix base.** Nova pairs
  Lucide icons with Geist, matching the typography and
  icon library already required by `ui-context.md`.
- **Palette expressed as hex.** The values in
  `ui-context.md` are hex, so they are used verbatim to
  keep the context file and the stylesheet directly
  comparable. The unused `--chart-*` tokens remain in
  oklch as generated.
- **Editor chrome lives in `components/editor/`.** The
  navbar, sidebar, shell, and dialog pattern are shared
  application components with no domain logic, so they sit
  under `components/` rather than `features/`, per the
  file-organisation rules in `code-standards.md`.
- **The chrome is applied in an `(editor)` route group
  layout.** Putting `EditorShell` in
  `app/(editor)/layout.tsx` means every editor route
  inherits the navbar and sidebar, and the sidebar keeps
  its open state across navigations because layouts do not
  rerender. The group is parenthesised so it adds no URL
  segment, which leaves room for routes that must *not*
  carry editor chrome — sign-in, and the project list —
  outside it. It is a nested layout, not a second root
  layout, so `app/layout.tsx` remains the only place with
  `<html>` and `<body>`.
- **The shell owns the sidebar open state.** The navbar
  and sidebar stay presentational and take `isSidebarOpen`
  / `isOpen` and their callbacks as props, so a later unit
  can lift the state into a route or a context without
  rewriting either component.
- **The sidebar is an overlay, not a Radix dialog.** The
  specification requires a panel that floats above the
  canvas without pushing content and without trapping the
  user, so it is a positioned `<aside>` inside the canvas
  region rather than a modal `Sheet`. It uses `inert` and
  `aria-hidden` while closed so the hidden controls stay
  out of the tab order and the accessibility tree.
- **Clerk is themed once, through `ClerkProvider`.** The
  appearance object lives in `lib/clerk-appearance.ts` and
  is passed to the provider, not to `SignIn` and `SignUp`
  individually, so every Clerk surface — including the user
  menu and the profile modal — inherits the palette. The
  overrides are all `var(--token)` references, so the Clerk
  components track `app/globals.css` and the specification's
  "no hardcoded colors" rule holds by construction.
- **The public route list is derived from Clerk's env
  vars.** `lib/auth-routes.ts` reads
  `NEXT_PUBLIC_CLERK_SIGN_IN_URL` and
  `NEXT_PUBLIC_CLERK_SIGN_UP_URL` rather than repeating
  `/sign-in` in the proxy. They are `NEXT_PUBLIC_*`, so
  Next.js inlines them at build time, which is what lets the
  proxy read them inside the edge runtime. Renaming a
  variable therefore also requires renaming the matching
  route folder under `app/(auth)/`.
- **The proxy protects by default and matches on a
  prefix.** `auth.protect()` runs for everything
  `isPublicPath()` rejects, so a route added later is
  protected unless it is deliberately made public.
  `isPublicPath()` replaced Clerk's `createRouteMatcher`,
  which is deprecated in this SDK version and logged a
  warning on every dev start. Clerk's reasoning — that path
  matching in a proxy can diverge from how Next.js resolves
  a request — is also why this gate does not satisfy
  invariant 6: project reads and mutations still need their
  own `await auth()` check.
- **The auth pages are optional catch-alls.**
  `sign-in/[[...sign-in]]` lets Clerk own the sub-paths for
  SSO callbacks, second factors, and password reset. A plain
  `sign-in/page.tsx` would 404 on those steps.
- **`/` is a redirect, not a page.** The editor moved to
  `/editor` and `app/page.tsx` only branches on
  `await auth()`. That keeps the `(editor)` group's chrome
  off the auth pages while leaving `/` as the single entry
  point. The proxy already protects `/`, so the
  unauthenticated branch is a deliberate fallback rather
  than the primary path.
- **Variant surfaces are mixed from an existing token, not
  added as new hex values.** The auth panel tint is
  `color-mix(in oklab, var(--primary) 15%,
  var(--background))`, so it cannot drift from the accent
  colour and there is still only one accent in the palette.
  Use the same approach for any future surface that is a
  variation on a token that already exists, rather than
  extending the core palette.
- **Project code lives in `features/projects/`, not
  `components/`.** The dialogs, the sidebar row, and the
  project client and service all carry project domain
  meaning, so they sit under `features/` per the
  file-organisation rules in `code-standards.md`. The
  chrome that merely *hosts* them — navbar, sidebar shell,
  `EditorDialog` — stays in `components/editor/`. The
  sidebar therefore imports a feature component while
  staying presentational itself.
- **A project has one identifier, and it is not derived from
  its name.** `Project.id` is the database key, the
  `/editor/[projectId]` segment, and the Liveblocks room ID.
  There is no slug and no short unique suffix — `project-slug.ts`
  was deleted rather than left unused — so a rename cannot
  change how a project is addressed and no reconciliation
  between a name and an ID is ever needed. This is why
  `lib/liveblocks.ts` has no rename operation: there is
  nothing a rename could affect.
- **The row is written before the room, and the room is
  deleted before the row.** Both orderings follow from the ID
  being shared. On create the ID does not exist until the row
  does, so the row must come first; if the room then fails, the
  row is deleted again, so a `201` never describes a workspace
  the user cannot open. On delete the room goes first, because
  after the row is gone nothing records which room belonged to
  it — an orphaned room would be unreachable forever, whereas a
  project whose room was removed is recovered by recreating it.
- **The project lists are fetched in the editor layout, not
  the sidebar.** The sidebar is a Client Component, so the
  layout is the closest server boundary above it. Fetching
  there means the first render already has the data and no
  client-side fetch runs on load, and it is what makes
  `router.refresh()` the whole refresh mechanism after a
  mutation — the layout re-runs and passes new lists down.
- **Access is decided by which query returned a row, not by a
  column.** There is no `access` field on `Project`:
  `listProjectsForOwner` and `listProjectsForCollaborator` are
  separate queries, and `toProjectSummary` tags the result. The
  sidebar therefore receives two ready-separated lists instead
  of filtering one, because there would be nothing on the row
  to filter by.
- **`getProjectLists` reads the session itself.** It takes no
  user ID, so no caller can pass somebody else's. It uses
  `currentUser()` rather than `auth()` because a collaborator
  is identified by email address — a consequence of there
  being no local `User` model — and only the full user object
  carries one. Clerk dedupes the call per request.
- **A failed mutation keeps the dialog open and reports the
  reason.** The hook stores an `error` string rather than
  closing optimistically, and `setDialogOpen` ignores a
  dismiss while a call is in flight, so a dialog cannot be
  closed out from under a request whose result it still has to
  report. A `403` or `404` surfaces as the route's own
  `{ error }` message inside the form the user would retry
  from.
- **One hook owns all three dialogs, shared through
  context.** `useProjectActions` holds a single
  `{ mode, project }` value rather than three booleans, so
  two dialogs cannot be open at once and prefilling the
  rename form happens in the same place that opens it. The
  instance is mounted once in `EditorShell` and passed down
  through `ProjectActionsProvider`, because the sidebar
  (inside the shell) and the editor home (inside
  `children`) must drive the *same* dialogs — a second
  `useProjectActions()` call in the page would open a
  second, unrelated set.
- **Owned-only actions are omitted from the DOM, not
  hidden.** A collaborator row renders no rename or delete
  button at all, so the controls cannot be reached by
  keyboard or by a script toggling CSS. This is a UI
  affordance only and is not an access control. The
  server-side ownership check required by invariant 6 has
  since been written and is what actually enforces this: the
  project mutations scope every write to `ownerId`, and the
  collaborator routes answer a non-owner's invite or removal
  with 403 regardless of what the client renders.
- **The mobile scrim is `sm:hidden`.** The sidebar is a
  non-modal overlay by an earlier decision, so a scrim at
  every width would block the canvas it deliberately floats
  above. Below `sm` the panel covers most of the screen and
  there is nothing useful left to click, so the scrim is
  added there only — it dims the canvas and gives the user
  somewhere to tap to dismiss.
- **The canvas region is a flex container.** `<main>` is
  `min-h-0 flex-1`, not `h-full`. A percentage height does
  not resolve against a flex item with an auto height, so
  `h-full` left `main` at its content height and any page
  centring itself with `h-full` appeared at the top of the
  canvas. Page content can now rely on filling the canvas.
- **Models live in `prisma/models/*.prisma`, not one
  `schema.prisma`.** Prisma's `schema: "prisma/"` config
  points at the folder, so the schema is multi-file:
  `schema.prisma` keeps only the `generator` and
  `datasource` blocks and each domain area gets its own file
  under `prisma/models/`. The full domain in
  `architecture.md` is a dozen records, which would make one
  file unreadable, and per-feature files keep each unit's
  diff small.
- **There is no local `User` model.** Clerk owns the user
  store, so `Project.ownerId` is a bare `String` holding a
  Clerk user ID with no foreign key, and a collaborator is
  identified by `email` because they may not have signed up
  yet. Nothing may join against a local users table — resolve
  identities through Clerk.
- **`canvasJsonPath` is a blob path, not canvas JSON.** Per
  the storage model, large files stay out of PostgreSQL. The
  column holds the Vercel Blob path to the architecture
  canvas document; the database keeps only the reference. It
  is nullable because a project has no canvas until one is
  saved.
- **`lib/prisma.ts` branches on the URL scheme rather than on
  `NODE_ENV`.** A `prisma+postgres://` URL is an Accelerate
  HTTP endpoint that no driver adapter can open, so it must
  use `accelerateUrl`; anything else is a wire-protocol
  Postgres server and uses `@prisma/adapter-pg`. Keying on
  the scheme means the same code works for a local
  `prisma dev` server, a direct Postgres instance, and
  Accelerate with no environment-specific configuration.
  Using Accelerate also requires installing
  `@prisma/extension-accelerate` if its caching APIs are
  wanted — it is **not** currently a dependency, and the
  plain `accelerateUrl` client works without it.
- **Route handlers authenticate themselves; the proxy skips
  `/api`.** `auth.protect()` only redirects what Clerk
  recognises as a page request — it inspects `Sec-Fetch-Dest`
  and `Accept` — and answers everything else by rewriting to
  a 404. Left under the proxy, every unauthenticated API call
  would therefore have returned `404` and no handler would
  ever have been reached to return `401`. The handlers read
  `await auth()` through `lib/api-auth.ts` and return their
  own status codes, which invariant 6 requires of them in any
  case. `/api` is excluded from the coarse gate but is **not
  public**: a route handler added later inherits no
  protection from the proxy and must authenticate itself.
- **A `403` and a `404` are decided before the mutation
  runs, and the mutation is scoped anyway.**
  `checkProjectOwnership` distinguishes a project that does
  not exist from one owned by somebody else, because the
  specification requires `403` for a non-owner and a bare
  `updateMany` returning zero rows cannot tell the two apart.
  The service still puts `ownerId` in its own `where` clause,
  so the statement cannot touch another user's row even if
  ownership changed between the check and the write. Belt and
  braces: the check produces the right status code, the
  scoped write produces the right effect.
- **The default name is applied by a `transform`, not
  `.default()`.** A Zod default only fills a *missing* key,
  so `{ name: "" }` and `{ name: "   " }` would have passed
  through as a blank name. The create schema therefore trims
  first and maps anything empty to `Untitled Project`, which
  is why the route needs no defaulting logic of its own.
  Rename uses the opposite rule and rejects a blank name, so
  a stray Enter cannot erase a project's name.
- **Responses omit `ownerId` and `canvasJsonPath`.** The
  service selects an explicit field list rather than
  returning the model. `ownerId` is always the caller and so
  carries no information, and `canvasJsonPath` is an internal
  blob path that no client should learn. A field added to the
  schema later is therefore private until it is deliberately
  added to `ProjectRecord`.
- **A page's access check answers three states; a route
  handler's answers three different ones.** `lib/project-access.ts`
  returns `unauthenticated`, `denied`, or `granted`, while
  `features/projects/project-access.ts` returns `owner`,
  `forbidden`, or `missing`. The split is deliberate: an API
  must distinguish `403` from `404`, whereas a page must not,
  because rendering a different screen for "not yours" than
  for "does not exist" confirms that somebody else's project
  exists. Both are the same invariant-6 check reaching
  different conclusions for different callers.
- **The page-level access helper lives in `lib/`, not
  `features/`.** It composes the Clerk provider with a
  project query, and provider adapters belong in `lib/` per
  the file-organisation rules. The query itself stays in
  `features/projects/project-service.ts`, so there is still
  exactly one place that knows what makes a project
  reachable.
- **An inaccessible workspace renders `AccessDenied` rather
  than `notFound()`.** The earlier route answered a bare 404,
  which dropped the user out of the editor with no route
  back. The screen keeps the chrome, explains as little as
  possible, and offers a link to `/editor`. It reveals no
  more than the 404 did: a missing project and a forbidden
  one render identical markup, and the refused project's name
  is never fetched, so it cannot leak.
- **The navbar's project name comes from the sidebar's
  lists, not a second query.** `EditorShell` matches
  `useParams()` against the owned and shared lists the editor
  layout already fetched — the same mechanism that marks the
  open row — so there is one source for "which project is
  open" and no extra round trip. It also fails in the right
  direction: a project the server refused is in neither list,
  so the navbar shows no name and no project actions rather
  than chrome implying access that was denied.
- **Project actions are scoped to a project being open, and
  so is the AI panel's mount.** Share and the AI toggle
  render only with a project open, because neither means
  anything on the editor home. The panel itself is mounted on
  the same condition, since its only control is that navbar
  toggle: mounting it unconditionally would let a user leave
  a workspace with the panel open and nothing left to close
  it.
- **An action whose behaviour is not built yet is
  `disabled`.** Introduced in unit 08 for the share button,
  which was present because the specification required it
  while sharing was out of scope — rendered visibly unready
  rather than wired to a no-op that would read as a bug. Unit
  09 wired it, so the pattern now has no live instance, but it
  is the rule for the next control that arrives ahead of its
  behaviour.
- **The server decides what a dialog may offer, and says so
  in the response.** `GET …/collaborators` returns
  `canManage` beside the list, computed from the same access
  check that authorised the read, and the share dialog renders
  the invite form and the remove buttons from that flag. The
  client never infers it by comparing a user ID to an owner
  ID, which would put an authorisation decision in the
  browser. It remains an affordance only — `POST` and `DELETE`
  re-check ownership regardless (invariant 6).
- **One access check reaches two different conclusions for
  the collaborator routes.** `GET` uses
  `resolveProjectAccess`, because a collaborator is allowed to
  see who else has access, while `POST` and `DELETE` use
  `checkProjectOwnership`, because a write must answer `403`
  and `404` differently. This is the page-versus-handler split
  from unit 08 applied within one feature rather than across
  two.
- **An email address is normalised in exactly two places,
  once per direction.** The invite schema lower-cases on the
  way in and `getCurrentIdentity()` lower-cases on the way
  out. Because `ProjectCollaborator.email` *is* the
  collaborator's identity and Postgres compares
  case-sensitively, any third place that builds an email
  filter would be a bug waiting to happen: a mixed-case row
  matches nothing, so the project silently never appears in
  `Shared`, and `@@unique([projectId, email])` would accept
  the same person twice. Route every email through those two
  functions.
- **Clerk display data is enrichment, not the source of
  truth.** `lib/clerk-users.ts` is the only module that asks
  Clerk who someone is, and a failure there returns an empty
  map rather than throwing, so the collaborator list still
  renders from this application's own database showing emails
  alone. Who has access is a fact this application owns; the
  name and avatar beside it are decoration from a provider
  that may be down. The same fallback covers an invitee who
  has never signed up, so there is one path, not two.
- **A Clerk email filter is a partial match, so the result
  map is keyed by what came back.** `getUserList({
  emailAddress })` is documented as case-insensitive and
  partial, so it can return users that were never asked for.
  Keying the profile map on each returned user's own addresses
  rather than on the requested ones makes a lookup an exact
  match by construction — keying it on the request would
  attach one person's name and avatar to another person's row.
- **The share dialog fetches on open, not with the page.**
  The navbar renders on every editor screen and most visits
  never open the dialog, so loading the list in the layout
  would add a Clerk round trip to every navigation. The
  pending state is set in the open handler rather than
  synchronously inside the effect that fetches — which React
  now warns about as a cascading render — and opening also
  clears the previous project's list, so reopening cannot show
  another project's collaborators while a request is in
  flight.
- **A list mutation is applied from the server's response,
  never optimistically.** An invite appends the row the route
  returned, so the ID a removal will address and the Clerk
  name and avatar are the server's rather than a local guess,
  and a removal drops a row only once the server confirms it.
  A failed removal that had already left the list would show
  the owner that access was revoked when it was not.
- **Liveblocks Storage is the only home for canvas state.**
  There is no PostgreSQL or blob copy of the nodes and edges, so
  there is nothing to reconcile and one writable canvas per
  project. The `ArchitectureVersion`, `ArchitectureComponent`,
  and `ArchitectureConnection` records remain in the domain model
  for the approved-version history — immutable snapshots are a
  different concern from the live document, and conflating them
  would put two writers on one diagram.
- **`useLiveblocksFlow` owns the React Flow state; there is no
  local node state.** It is the controlled-flow pattern: the
  arrays it returns come from Storage and its handlers write back
  to it. Adding a `useNodesState` beside it would create a second
  copy of the diagram to keep in sync, which is exactly the
  problem the collaborative document solves.
- **The `Storage` type is derived from the canvas' own node and
  edge types, not hand-modelled.** `Storage.flow` is
  `LiveblocksFlow<CanvasNode, CanvasEdge>`, so the shape of the
  collaborative document is computed from the same types React
  Flow renders. A hand-written tree could drift from what the
  hook actually writes; this cannot.
- **The client boundary is as low as it can be.** The workspace
  page stays a Server Component and resolves access; the room is
  joined in `canvas-room.tsx`, the first client component on the
  path. A provider higher up would make the whole editor a client
  tree for a concern that only the canvas has.
- **The room ID passed to the provider is the project the server
  resolved**, `access.project.id`, not the raw route parameter.
  They are the same string today, but taking it from the resolved
  project means the value handed to Liveblocks is one the access
  check has already vouched for.
- **Radius follows the generated primitives.** The earlier
  `ui-context.md` radius table conflicted with the shadcn
  defaults. Rather than restyle protected files in
  `components/ui/`, `ui-context.md` was updated to document
  the generated scale, and `--radius` was returned to the
  generated `0.625rem`. Application components now match
  the primitives instead of diverging from them.
- **Grouping a resize into one undo step is the library's job, so
  this application does not do it.** `@liveblocks/react-flow`
  already pauses history on a `dimensions` change with
  `resizing: true` and resumes on `resizing: false`, which was read
  in its shipped source rather than assumed. Pausing again from the
  node renderer would nest a pause nothing balances, and Liveblocks
  does not reference-count them — a stray `resume()` commits whatever
  is paused, including another gesture's frames. **The label editor
  is the opposite case and does pause**, because typing produces no
  gesture boundary the integration can see: it pauses on open and
  resumes on close, tracking in a ref whether the pause is its own so
  it cannot commit a resize's.
- **An editing session is local state; only its result is
  collaborative.** Whether a label editor is open lives in
  `useState` in the node renderer, and reaches neither Storage —
  a room's document is the diagram, not who is midway through
  renaming part of it — nor Presence, nor Prisma. **The text being
  typed is not local**, though: each keystroke goes through
  `updateNodeData`, which React Flow diffs into the same
  `onNodesChange` a drag uses, so the label on screen *is* the
  collaborative value. That is why `Escape` closes without reverting,
  and it keeps the no-second-copy-of-node-state rule above intact for
  editing as well as for dragging.
- **A resize floor is a per-shape token, not a renderer constant.**
  `minWidth` and `minHeight` sit beside `defaultWidth` and
  `defaultHeight` in `canvasNodeShapeTokens` for the same reason the
  defaults do: the shape decides how much room a label needs, so a
  hexagon's floor is wider than a rectangle's at the same drawn
  width. `circle`'s is square, because a circle resizes with its
  ratio locked and a non-square floor could never be reached.
- **The resize controls are styled inline, and it is the one
  deliberate exception to classes-only styling.** React Flow's
  `base.css` reaches a control through `.react-flow__resize-control`
  plus `.handle`, two classes, which a single Tailwind utility cannot
  outrank — the handle would keep a hardcoded `#fff` border. The
  styles are still `var(--token)` references held in the shared token
  map, so no literal colour enters the codebase and no dimension
  enters a component; `ui-context.md` records the exception.
- **The current user's `UserButton` moved into the canvas rather than
  being duplicated there.** Unit 19's specification asked for the
  participant group to render "the current user separately using the
  existing Clerk `UserButton`" while also keeping the project navbar
  actions unchanged and showing the current user **once** — and the
  navbar already held that button. The reading taken: the navbar
  renders it only when no project is open, and the participant group
  renders it when one is. The literal alternative, leaving the navbar
  button and adding a second one, would put the same person on screen
  twice a few pixels apart and fail the unit's own check. The navbar's
  Templates, Share, and AI actions are untouched, the editor home is
  unchanged, and Clerk's profile and sign-out flows are not replaced —
  which is what keeps this inside the scope limits rather than a navbar
  redesign.
- **Cursor presence is `@liveblocks/react-flow`'s `Cursors`, not a
  hand-rolled broadcast.** Its shipped source was read before choosing
  it, and it already satisfies every requirement the unit lists: the
  `cursor` presence key this application declares, `screenToFlowPosition`
  for the outgoing point, this viewer's own transform for the incoming
  ones, `null` on leave and blur and unmount, and others only. Writing
  a second version would have duplicated behaviour already in the tree
  and needed a `useUpdateMyPresence` throttle of our own. Only the
  appearance is ours, through `components.Cursor`. The same reasoning
  as the resize-history decision above: when the integration already
  owns a behaviour, this application does not repeat it.
- **A snapshot request carries no canvas, and the route takes no body.**
  The obvious design — post the nodes and edges the client already has —
  was rejected: those arrays are one participant's view of a document
  several people are writing, so trusting them would make the browser a
  second source of truth for the diagram and let any caller overwrite a
  project's snapshot with anything at all. The server reads the room
  itself through `getStorageDocument(projectId, "json")`. The client's
  only role is to notice that something changed, which is also why the
  hook's status is local and its request is a bare `PUT` with a project
  ID in the URL.
- **Blob snapshots are `access: "private"`, and the pathname is
  deliberately deterministic.** `projects/<projectId>/canvas.json` with
  `addRandomSuffix: false` and `allowOverwrite: true` means one file per
  project that each capture replaces, so `canvasJsonPath` stays valid
  and nothing accumulates — but it also means the URL is *guessable* by
  anyone who knows a project ID, and project data is access-controlled.
  Private access is what reconciles the two. It is isolated as one
  `BLOB_ACCESS` constant, because a store without private-blob support
  would make every snapshot fail and that is the one line to change.
- **Change detection is a signature over document fields, not array
  identity.** Depending on `[nodes, edges]` would loop forever:
  `saving` → `saved` re-renders, React Flow hands back fresh
  identities, and the effect fires again. The signature also *excludes*
  `selected`, `dragging`, and `measured`, so a selection click or a
  hover — which are one viewer's local state and not part of the
  document — cost no snapshot. This is the same
  what-belongs-to-the-document line the viewport and drag-preview rules
  above draw, applied to deciding when to save.
- **The snapshot baseline advances when a request starts, not when it
  succeeds.** A failed snapshot is therefore left alone until the canvas
  changes again, rather than retried against a server that is still
  failing. It is affordable precisely because a snapshot is *secondary*:
  the canvas is safe in the room, so the cost of not retrying is one
  stale file and the cost of retrying is an unbounded loop. The
  first-sight baseline is stored as `{ projectId, signature }`, which
  makes navigating between projects behave like a first mount in the
  same branch.
- **`canvasJsonPath` is written unscoped by owner, unlike the rename and
  the delete.** A collaborator editing the canvas is snapshotting it, so
  scoping the update to an owner would silently stop saving for exactly
  the users the feature is for. Access is already resolved by the route
  (invariant 6), which is what makes the unscoped `updateMany` safe
  rather than lax — and `updateMany` rather than `update` so a project
  deleted mid-request is a `404` rather than a thrown exception.

## Session Notes

Resize and inline-editing notes (added 2026-08-14, from the unit 14
build). Read from React Flow's, `@xyflow/system`'s, Liveblocks', and
`d3-zoom`'s shipped source rather than assumed:

- **`stopPropagation` cannot stop React Flow's double-click zoom.**
  The zoom is a `d3-zoom` listener attached to the pane, below React's
  own root, so a React handler runs after d3 has already seen the
  event. What *does* stop it is `nopan` on an ancestor:
  `d3-zoom`'s `dblclicked` calls `filter.apply` first, and React
  Flow's `createFilter` rejects any event inside an element carrying
  the class. The same filter path covers dragging, and `nodrag` is
  matched the same way — so the interaction classes are not a
  convenience over `stopPropagation`, they are the only thing that
  works.
- **Liveblocks' `pause()`/`resume()` are asymmetric, not a counter.**
  `pauseHistory` is a no-op when history is already paused, but
  `resumeHistory` commits whatever is paused as one undo frame — so
  the second `pause()` is harmless and the second `resume()` is not:
  it hands somebody else's frames to the undo stack. Anything that
  pauses history has to know whether the pause is its own before
  resuming, which is what a `useRef` flag beside the state is for.
- **`updateNodeData` is not a separate write path.** It goes
  `updateNode` → `setNodes` → the batch queue →
  `getElementsDiffChanges` → a `replace` change → `onNodesChange`,
  which is the Liveblocks mutation, whose `replace` branch calls
  `existing.reconcile(item, config)`. So a per-keystroke data update
  travels the same route a drag does and needs no new mutation, and
  there is nothing local to commit later.
- **`keepAspectRatio` reads the ratio at the start of the gesture,**
  in `getDimensionsAfterResize`, not from a prop — so a shape stays
  square only if it *is* square when the drag begins. The token map's
  square default and square minimum for `circle` are what make the
  lock mean 1:1, and a non-square minimum would have been a floor the
  locked drag could never reach.
- **React Flow already puts `nodrag` on every resize control**, so
  dragging a handle does not also drag the node and nothing had to be
  added for it. Its `base.css` also styles a control through two
  classes (`.react-flow__resize-control.handle`) and hardcodes
  `border: 1px solid #fff`, which a single utility class loses to —
  the reason the control styling is inline.

Drag-and-drop notes (added 2026-08-14, from the unit 13 build).
Read from the HTML drag-and-drop specification and React Flow's
shipped source rather than assumed:

- **A native HTML5 drag suppresses mouse events.** There are no
  `mousemove` events at all between `dragstart` and `dragend`, so a
  cursor-following preview cannot be driven by one. The drag events
  are the only ones carrying coordinates while a drag is in flight,
  which is why the preview listens to `dragover` on the document.
- **Listening to `dragover` is not the same as accepting a drop.**
  Only `preventDefault` on that event marks an element as a drop
  target — the browser's default is to refuse — so a listener that
  reads `clientX`/`clientY` and returns observes the drag without
  making the whole page droppable. The canvas' own handler still
  decides where a component may land.
- **The browser draws its own drag image, and it is not
  suppressible by omission.** Left alone it is a translucent
  snapshot of the dragged element, so adding a ghost gives you
  *two* previews of one drag. `setDragImage` with a transparent
  1×1 element is the way to hide it, and a `canvas` beats an
  `Image` because `setDragImage` needs an image that has already
  loaded and `dragstart` cannot wait for one.
- **`dragend` covers cancellation as well as a drop.** It fires on
  the drag *source* in both cases — a successful drop, an Escape,
  and a release outside any drop target — so one handler on the
  source removes a preview in every case. The drop target does not
  have to report back, and no separate `dragleave` bookkeeping is
  needed.
- **A `fixed` element inside React Flow's viewport is not fixed to
  the viewport.** The viewport carries a `transform`, which makes
  it a containing block for `position: fixed` descendants, so pan
  and zoom get applied to the element a second time. Portal a
  cursor-tracking overlay to `document.body`.
- **A ghost under the cursor eats the drop.** Without
  `pointer-events-none` the preview is the element under the
  pointer, so the drop event goes to it rather than to the canvas.

Liveblocks notes (added 2026-08-12, from the unit 10 build).
Four faults, none of which were guessable from the docs:

- **Importing the `Liveblocks` class shadows the global
  `Liveblocks` interface.** `lib/liveblocks.ts` imports the
  class from `@liveblocks/node`, so
  `Liveblocks["UserMeta"]["info"]` there resolves against the
  *class* and fails with
  `TS2339: Property 'UserMeta' does not exist on type 'Liveblocks'`.
  The global type contract is unreachable from exactly the
  module that most needs it. Export a **named alias** from the
  config (`ProjectUserInfo`) and import it as a type — one
  definition, and the config and the adapter cannot drift.
- **`IUserInfo` allows `undefined` but not `null`.** The real
  constraint in `@liveblocks/core` is
  `{[key: string]: Json | undefined; name?: string; avatar?: string}`,
  so declaring `avatar: string | null` fails with a `TS2322`
  whose "expected type" is a **prose sentence** —
  `Type ... is not assignable to type '"The type you provided for 'UserMeta' does not match its requirements..."'`.
  Read the constraint rather than the message. Declare
  `avatar?: string` and **spread the key conditionally**; a
  nullable field anywhere upstream has to be narrowed at the
  boundary, not passed through.
- **A throwaway `.mts` harness fails `next build`,** because
  `tsconfig.json` includes every `.mts` file in the tree. The
  application compiled cleanly
  ("✓ Compiled successfully") and then the TypeScript step
  failed on `verify-unit-10.mts` alone —
  `An import path can only end with a '.ts' extension`, because
  a harness that imports the real modules by path is fine under
  `tsx` and illegal under the project's own config. **Delete the
  harness before the final build**, and do not read a
  post-compile type error as an application defect until the
  path is checked.
- **`await import("./x.ts?suffix")` does not produce a fresh
  module under `tsx`.** The query suffix is not a distinct
  specifier for a relative `.ts` path, so the namespace comes
  back empty and `instanceof` on one of its exports throws
  `Right-hand side of 'instanceof' is not an object`. To test a
  configured and an unconfigured branch in one process, order
  the checks instead of trying to reload: **check the
  unconfigured branch first**, with the variable deleted, then
  set it. This works here because `lib/liveblocks.ts` caches its
  client only *after* the secret check passes, so a failed call
  caches nothing.
- **The adapter's idempotent create is a bare flag.**
  `getOrCreateRoom` is `createRoom` with `idempotent: true`, and
  it emits `POST /v2/rooms?idempotent` — **not**
  `idempotent=true`. An assertion looking for the value fails
  against correct behaviour. Confirmed at
  `node_modules/@liveblocks/node/dist/index.js:831`; the
  standing practice of reading the shipped `.js`/`.d.ts` rather
  than recalling the API is what caught it.
- **A stub server proves what we send, not that it is
  accepted.** Pointing `LIVEBLOCKS_BASE_URL` at a local
  `node:http` server is the only way to verify the outgoing
  requests with no account key — and it verified real things
  (exactly one room granted, no wildcard, no project name in
  any body). But it cannot tell you whether Liveblocks accepts
  the request or whether a browser can join with the token.
  Say which half is proven.

Canvas notes (added 2026-08-12, from the unit 11 build). Four
things worth reading the shipped source for:

- **A required `Storage` key makes `initialStorage` a required
  prop.** `RoomProviderProps` runs both `Presence` and `Storage`
  through `PartialUnless<C, T>`, which is
  `Record<string, never> extends C ? Partial<T> : … : T` — so the
  moment `Storage` gains a required key, `RoomProvider` demands
  `initialStorage`. That conflicts with any integration hook that
  initialises its own subtree, `useLiveblocksFlow` included.
  Declare the key **optional**; `LsonObject` is
  `Record<string, Lson | undefined>`, so it still typechecks, and
  it is the truthful shape for a room nobody has opened.
- **A Liveblocks connection failure is not catchable by an error
  boundary.** It surfaces as an *event*, not a throw:
  `fireErrorEvent` → `LiveblocksError` with
  `ROOM_CONNECTION_ERROR` → `errorEventSource.notify`, and
  **when nothing is subscribed, `if (!didNotify)` logs it to the
  console in development and nowhere else.** Meanwhile
  `waitUntilStorageReady` is `while (!isStorageReady()) await
  getStorage()`, so a room that can never connect leaves
  `ClientSideSuspense` on its fallback indefinitely. A loading
  state without `useErrorListener` beside it is therefore a
  permanent spinner, not a slow load. The listener must sit
  inside `LiveblocksProvider`, since it subscribes to the client.
- **React Flow cannot be sized by its caller.** It merges
  `style={{...style, ...wrapperStyle}}` where `wrapperStyle` is
  `width: 100%; height: 100%`, so the caller's value loses. The
  parent must resolve to a height instead — which is the same
  trap `ui-context.md` already records for `<main>`, met from the
  other direction.
- **Only `base.css` is needed until controls exist.** It carries
  the MiniMap rules, the background patterns, **and** the
  `.react-flow.dark` block that redefines every `--xy-*` default;
  `style.css` adds default-node chrome and controls styling. And
  the dark values are inert without `colorMode="dark"`, which is
  what puts the class on the root. Colours can still come from
  project tokens: `Background`'s `color` and the MiniMap's
  `bgColor`/`maskColor`/`nodeColor` are forwarded into
  `--xy-*-props` variables, so a `var(--token)` reference
  resolves.

Review notes (added 2026-08-12, from the CodeRabbit pass):

- **A wildcard in `.claude/settings.json` `allow` is a
  destructive-command grant.** `Bash(npx prisma *)` reads as
  "Prisma commands" but auto-approves `migrate reset`,
  `db push --accept-data-loss`, `db execute`, and `db seed`.
  List subcommands explicitly, and keep anything that writes
  data or schema out of `allow` so consent is still asked for.
- **Compensating for a remote create means assuming the create
  may have succeeded.** A thrown error from an HTTP call is
  ambiguous — a timeout or a dropped response can follow a
  completed write. So the rollback deletes the remote resource
  before the local row that names it, and gives up on the row
  if that fails; the row is the only thing that remembers the
  remote ID. The delete tolerating `404` is what makes the
  no-room-was-created case safe.
- **A hook mounted in the shell outlives the route.**
  `EditorShell` persists across `/editor/[projectId]`
  navigations, so any hook it owns keeps its state when the
  project changes. Resetting on open is not enough — key the
  state to its subject (`openForProjectId`, not `isOpen`) so it
  cannot outlive what it describes. Clear a stale subject
  **during render**, not in an effect: an effect commits one
  render in which the dialog and the project disagree, and
  `react-hooks/set-state-in-effect` rejects it. Deriving from a
  match alone is also wrong — the stale ID survives and
  navigating A → B → A reopens the dialog with no user action.
- **`asChild` needs `ReactElement`, never `ReactNode`.** Radix
  calls `React.Children.only` on it, so `ReactNode` moves a
  compile-time error to a render-time throw.
- **Most of a review can be about code that is not yours.** 253
  of 259 comments landed in vendored skill documentation. Filter
  by path before reading, and do not "fix" third-party content
  that is only carried here.

Browser-verification notes (added 2026-08-11, from the
units 01–09 CDP run). These cost real time to find:

- **A Clerk ticket session degrades under a long run.** Signing
  in with `__clerk_ticket` works, but after a few minutes of
  driving it the server log fills with "Refreshing the session
  token resulted in an infinite redirect loop" and every
  authenticated request answers `401`. The keys are fine — both
  resolve to one development instance, and an *idle* page held a
  200 for 3 minutes straight. Mint a **pool** of single-use
  tickets and re-sign-in when a check sees a `401`, and treat a
  mid-run `401` as a harness fault to attribute rather than a
  feature failure to report.
- **Kill the Chrome process tree, not the process.** `proc.kill()`
  leaves renderers alive holding the inherited stdout pipe, so a
  run piped to `tail` appears to hang long after every check
  passed. Use `taskkill /PID <pid> /T /F` and remove the temp
  profile directory — orphaned profiles accumulate and the
  resulting contention makes `Page.navigate` time out.
- **Write harness output to a file, not through a pipe.** For the
  same reason: `node harness.cjs > log 2>&1` shows progress
  live, while `| tail` shows nothing until exit.
- **`ERR_ABORTED` is not a failure.** Correlate against
  `Network.responseReceived` first: a superseded RSC prefetch
  reports `ERR_ABORTED` *after* being answered `200`. Only count
  requests that never received a status.
- **A `type="email"` input rejects `setSelectionRange`.** Clear a
  controlled field with real Backspace key events — assigning
  `.value` bypasses React's state and the component never sees
  the change.
- **Radix removes `AvatarFallback` once the image loads**, so
  assert "the slot is never blank" (fallback present *or* image
  complete), not that the fallback exists.
- **Give a test project a unique name.** An earlier aborted run
  left a project sharing a name substring, which made a passing
  delete look like a bug until it was isolated.
- Match a submit button by `button[type="submit"]` inside its
  form, not by its text: the label changes to `Inviting…` while
  the request is in flight and a text match then throws.

- `shadcn init` overwrites `app/globals.css` with the
  default light/dark neutral palette. If the CLI is re-run,
  the dark palette must be re-applied.
- `app/globals.css` imports `shadcn/tailwind.css`, which
  resolves to `node_modules/shadcn/dist/tailwind.css`. The
  `shadcn` package is therefore a runtime styling
  dependency, not just a CLI tool.
- The Dialog primitive uses the Radix `asChild` API
  (`<DialogTrigger asChild>`), not a `render` prop.
- `--font-sans` and `--font-mono` in the `@theme inline`
  block are mapped to the `--font-geist-sans` and
  `--font-geist-mono` variables set in `app/layout.tsx`.
- The generated `Button` and `TabsTrigger` size icons
  through `[&_svg:not([class*='size-'])]:size-4`, so
  Lucide icons need no explicit size class. `Button`
  tightens its padding from a `data-icon="inline-start"`
  or `data-icon="inline-end"` attribute on the icon.
- Radix `DialogContent` already omits `aria-describedby`
  when no `DialogDescription` is rendered, so the optional
  description in `editor-dialog.tsx` needs no override.
- The `dark:` variants in the generated primitives are
  what colour several surfaces (for example the active
  tab trigger), which is why the `dark` class must stay on
  `<html>`.
- Next 16 generates the global `LayoutProps<"/">` and
  `PageProps` helpers during `next dev`, `next build`, or
  `next typegen`. They need no import, and
  `app/(editor)/layout.tsx` is typed with
  `LayoutProps<"/">` — the route group is absent from the
  path because it adds no URL segment. Run
  `npx next typegen` if a route's types are missing.
- A `next dev` server holds a lock, so a second
  `next dev` exits with "Another next dev server is
  already running" and prints the owning PID to kill.
- With no publishable key, `@clerk/nextjs` starts in
  **keyless mode**: it mints a throwaway instance, writes
  the keys to `.clerk/.tmp/keyless.json` and `.env.local`,
  and prints a claim URL. `auth()` reads the key from
  `process.env` at import time, so until `.env.local` has
  it, `auth()` throws "Missing publishableKey" while the
  proxy still works. Restarting the dev server after the
  keys land clears it. `/.clerk/` is gitignored because it
  holds the unclaimed instance's secret key.
- `next typegen` does not prune types for deleted routes.
  After moving `app/(editor)/page.tsx`, `tsc` failed on a
  stale `.next/dev/types/validator.ts` import; `rm -rf
  .next/dev` then `npx next typegen` fixes it.
  **It does not clean `.next/dev/types` for *added* routes
  either (seen again 2026-08-13, unit 12).** `tsconfig.json`
  includes both `.next/types` and `.next/dev/types`, and typegen
  writes only the first, so a `.next/dev/types/routes.d.ts` left
  by an older `next dev` shadows it with a narrower
  `AppRouteHandlerRoutes`. The symptom is `tsc` failing on a route
  file that is correct — `RouteContext<"…">` "does not satisfy the
  constraint" and its `params` typed `unknown` — while
  `.next/types/routes.d.ts` visibly lists that route. Re-running
  typegen does not help; delete `.next/dev/types` (or `.next/dev`).
- Clerk's `auth.protect()` only issues a redirect when it
  recognises a page request — it checks `Sec-Fetch-Dest`
  and `Accept`. A bare `curl` gets a 404 instead of a 307,
  so send `-H "Accept: text/html"` when testing route
  protection from the shell.
- Clerk's `Variables` type accepts a `fontSize` that is the
  **base `md`** — it derives `xs`, `sm`, `lg`, and `xl` from
  that one value, so a single override rescales the whole
  card. Its default is `0.8125rem`, smaller than the
  application's base.
- To check a font is genuinely applied rather than silently
  falling back, read `CSS.getPlatformFontsForNode` over CDP.
  `getComputedStyle().fontFamily` only reports what was
  *requested*; the platform-fonts call reports the family
  the browser actually rendered glyphs with.
- A stale `next dev` on port 3000 makes a new server move to
  3001 while requests to 3000 still hit the dead process, so
  probes return errors that look like application bugs.
  Check the reported port in the dev output before trusting
  a failed request.
- `npm init -y` writes `"type": "commonjs"`, which makes
  Turbopack reject every `.ts`/`.tsx` file with "Specified
  module format (CommonJs) is not matching the module format
  of the source code (EcmaScript Modules)" and returns 500
  for every route. Never run it in the project root.
- `DialogFooter` already supplies `justify-end`, a top
  border, and a `bg-muted/50` strip, so a footer only needs
  the buttons themselves. Pair `DialogClose asChild` with an
  outline `Button` for cancel, so dismissing needs no state
  change.
- A submit button outside a `<form>` still submits it via
  `form="<form-id>"`. That is how the dialogs get Enter-to-
  submit while keeping the actions in `DialogFooter`, which
  Radix renders as a sibling of the body.
- Radix `Tabs` in this version **unmounts** the inactive
  `TabsContent` — the inactive panel's `textContent` is empty,
  so the other tab's rows cannot be queried until that tab is
  activated. (An earlier note here claimed the opposite;
  measured directly on 2026-08-06.) Scope to
  `[role="tabpanel"][data-state="active"]` either way.
  `TabsTrigger` exposes no `value` attribute in the DOM —
  target it by `aria-controls$="-content-<value>"`.
- **Radix `ScrollArea` wraps a viewport's children in a
  `display: table` element**, so a percentage height inside one —
  `h-full` on a centred empty state, for instance — does not
  resolve and the content collapses to its own height at the top.
  Put anything that must fill the scroll region **beside** the
  `ScrollArea`, as a sibling flex child, rather than inside it.
- **`TabsTrigger` activates on pointer events and ignores a
  synthetic `element.click()`.** A CDP-driven test must dispatch
  a real `Input.dispatchMouseEvent` press/release at the
  trigger's centre, or the tab silently never switches and the
  feature reads as broken. Plain `<button>`s in the application
  (the sidebar rows, the dialog actions) are fine with
  `.click()`.
- The Clerk development instance for this project **requires
  a username**. `signUp.create({ emailAddress, password })`
  stalls without one, and the Backend API returns
  `form_data_missing` for `["username"]`. Any scripted
  sign-up must send a username.
- To create a signed-in browser session for verification,
  mint a `/v1/sign_in_tokens` ticket with the Backend API and
  open `/sign-in?__clerk_ticket=<token>`. This is far more
  reliable than driving Clerk's form, and the throwaway user
  should be deleted afterwards.
- Clerk's browser telemetry endpoint
  (`clerk-telemetry.com/v1/event`) is blocked on this
  network and logs a stream of `ERR_CONNECTION_RESET`
  entries. They are not application errors — filter failed
  requests to `localhost:3000` before judging console
  health.
- Dispatching Enter over CDP needs `text: "\r"` on the
  `keyDown`. A bare `keyDown`/`keyUp` pair with only `key`
  and `windowsVirtualKeyCode` does not trigger a form's
  implicit submission, which reads as a broken feature.
- Prisma 7 keeps the connection URL in `prisma.config.ts`,
  **not** in `schema.prisma`. The `datasource` block holds
  only `provider = "postgresql"` — adding a `url` there is
  the Prisma 6 pattern. `prisma.config.ts` imports
  `dotenv/config`, because Prisma does not read `.env`
  itself.
- The generated client is written to `app/generated/prisma/`
  and imported as `@/app/generated/prisma/client` — note the
  `/client` suffix. It is gitignored, so `prisma generate`
  must run before `tsc` or `next build` on a fresh checkout.
- `prisma migrate dev` needs a reachable database even with
  `--create-only`; it will not write a migration offline. To
  produce migration SQL with no connection, use
  `prisma migrate diff --from-empty --to-schema prisma
  --script -o <path>/migration.sql` and add
  `migration_lock.toml` by hand. Note the flag is
  `--to-schema`; `--to-schema-datamodel` was removed in
  Prisma 7.
- `prisma dev` starts a throwaway local Prisma Postgres
  server, which is the way to verify a migration when the
  real database is unreachable. It prints both a
  `DATABASE_URL` and a `SHADOW_DATABASE_URL`; manage
  instances with `prisma dev ls|start|stop|rm -n <name>`.
- Prisma error codes distinguish the two connection paths,
  which is useful for diagnosis: `P1001` is "can't reach
  database server" from a driver adapter, and `P6001` is an
  invalid `accelerateUrl`. `P2002` is a unique-constraint
  violation.
- A `PrismaClient` validates its URL **lazily**, on the
  first query rather than at construction. Instantiating one
  with a deliberately broken URL therefore succeeds, so a
  test that only constructs a client proves nothing about
  which branch it took.
- Outbound TCP 5432 is intercepted on this network in a way that
  looks like a working connection: the connect succeeds, and then
  the `SSLRequest` goes unanswered, so clients report a generic
  timeout and Prisma reports `P1001`. **A successful TCP connect
  on 5432 proves nothing here.** The proof it is a proxy and not
  the real server: `accelerate.prisma-data.net:5432` also
  "connects" although it serves no Postgres, while port 54329 on
  `db.prisma.io` gives `ETIMEDOUT` and a nonexistent host gives
  `ENOTFOUND`. Diagnose by sending the 8-byte `SSLRequest` frame
  manually rather than by connecting; compare against 443 on the
  same host, which completes a real TLS handshake with a matching
  certificate. Suspect the network before the credentials when a
  Prisma Postgres `postgres://` URL times out — and note the
  interception behaviour is not stable over time, so re-measure
  rather than trusting an earlier note.
- In development Clerk answers the first request per
  browser with a 307 to its `/v1/client/handshake`
  endpoint to set the dev-browser cookie. Use a cookie jar
  (`curl -L -c jar -b jar`) or the redirect chain looks
  like it leaves the application.
- `prisma dev start` takes the server name **positionally**,
  not as `--name`; `prisma dev --name <n>` is what creates
  one. `prisma dev rm <n>` needs `--yes` to skip its prompt,
  and the server must be stopped first or the removal is a
  no-op that prints nothing.
- `prisma dev ls` prints its URLs as OSI-8 terminal
  hyperlinks, so the escape sequence duplicates each URL and
  `grep -o` returns it twice concatenated. Strip `\033` and
  split on `;` before matching, or build the TCP URL from the
  reported port instead.
- The local `prisma dev` Accelerate endpoint rejects a client
  it considers too new — `P6000`, "Using an HTTP connection
  string is not supported with Prisma Client version 7.9.1 by
  this version of `prisma dev`". Its **TCP** URL works
  unchanged, so use `postgres://…` for scripts that talk to a
  throwaway server, which also exercises the `PrismaPg`
  adapter branch of `lib/prisma.ts` rather than the
  Accelerate one.
- `dotenv/config` reads `.env` only. The Clerk keys live in
  `.env.local`, which Next.js loads but `dotenv` does not, so
  a script that expects `CLERK_SECRET_KEY` from
  `dotenv/config` sees nothing. Do not make scripts read the
  env files — pass what a one-off run needs on the command
  line instead, so secrets never reach a committed file or
  the console.
- A verification script can reach the route handlers'
  behaviour without a Clerk session: check the
  unauthenticated paths over HTTP, and import the schema,
  service, and access modules directly for the rest. That
  covers the logic the session would have exercised and needs
  no keys and no throwaway users.
- `prisma dev` renders an interactive TUI and writes **nothing**
  when its output is piped or redirected to a file, so a
  backgrounded `prisma dev > log` produces an empty log and no
  reachable server. Units 05 and 06 verified against it from an
  interactive terminal. There is no known way to obtain its
  connection URL from a non-interactive run, so plan on either
  a reachable real database or an interactive shell.
- `@liveblocks/node` takes an optional `baseUrl`, which makes
  the adapter testable without a Liveblocks account: point it
  at a local `node:http` stub and assert on the requests it
  sends. `lib/liveblocks.ts` exposes it as
  `LIVEBLOCKS_BASE_URL` for exactly this. Its client is
  constructed from `new Liveblocks({ secret })`, rooms are
  `POST /v2/rooms` with the ID **in the body** (not the path)
  and `DELETE /v2/rooms/<id>`, and `LiveblocksError.status`
  carries the HTTP status for branching on `409`/`404`.
- Build the Liveblocks client lazily inside a function, not at
  module scope. `next build` imports every route handler
  without a runtime environment, so reading a required secret
  at import time fails the build rather than the request.
- `updateManyAndReturn` exists on the generated client and is
  the way to do a scoped update that returns the row.
  `update` takes a `WhereUniqueInput`, so it cannot be
  constrained by `ownerId` as well as `id`.
- `prisma dev ls` reports a **running** server whose ports bind
  to **IPv4 only**. A probe using the host `localhost` may
  resolve to `::1` and time out, which looks exactly like a dead
  server — use `127.0.0.1` explicitly. The server also does not
  reply to a hand-sent Postgres `SSLRequest` frame when the URL
  carries `sslmode=disable`, so absence of a reply there proves
  nothing; connect with `pg` instead.
- An **already-running** `prisma dev` server can be reused, which
  sidesteps the TUI problem entirely: read its TCP URL from
  `prisma dev ls` (or rebuild it from the reported port) rather
  than starting a new one non-interactively.
- A route folder whose name starts with an underscore is a
  **private folder** in App Router and is not routable —
  `app/api/__probe/route.ts` answers `404`. Name a temporary
  probe route without the underscore.
- The `destructive` Button variant in this Nova preset is a
  **tinted** fill (`dark:bg-destructive/20`) with
  `text-destructive`, not a solid red block. `#ef4444` computes
  to `oklab(0.6368 0.1879 0.0889)`, so assert against the
  `--destructive` token rather than expecting
  `rgb(239, 68, 68)` as a background.
- `pg` 8.22 treats `sslmode=require` as an alias for
  `verify-full` and prints a deprecation warning saying so; in
  `pg` 9 it will adopt libpq semantics instead. The project's
  `DATABASE_URL` uses `sslmode=require`, and it **is** enforced
  — a query against a plaintext local server hangs on the TLS
  attempt rather than connecting. Use
  `sslmode=verify-full` explicitly to keep today's behaviour
  across that upgrade.
- A backgrounded `next dev` started from a shell that later
  times out is killed with it, and the port then reads as
  closed. Start it as a genuinely detached background task, and
  expect `EADDRINUSE` rather than a free port if an earlier one
  survived — check the port before assuming a start failed.
- `prisma migrate diff` needs `--from-config-datasource
  prisma.config.ts` in Prisma 7 to diff against the live
  database. `--from-schema-datasource prisma/schema.prisma`
  fails here, because the `datasource` block holds no `url` —
  the URL lives in `prisma.config.ts`.
- Node resolves `require()` from the **script's own** directory,
  so a harness kept outside the repository cannot `require("pg")`
  from the project's `node_modules`. Pass an absolute path, or
  keep the script inside the project and delete it afterwards.
- **In Prisma 7 the generated client is TypeScript source, not
  compiled JavaScript.** `app/generated/prisma/` holds
  `client.ts`, `models.ts`, and `enums.ts`, so a plain `.cjs`
  harness cannot `require()` it — the require fails with
  `MODULE_NOT_FOUND` on a path that plainly exists. Seed and
  assert with `pg` directly from a throwaway script, and leave
  Prisma to the application code being verified.
- **Drive browser verification against `next start`, not
  `next dev`.** A dev server compiles each route on first
  request, so a CDP `Page.navigate` can exceed a 30s command
  timeout, and a driver that keeps navigating while compiles
  are queued wedges the server: the port stays `LISTENING`
  while every request returns nothing, which reads exactly
  like a crash. Run `npm run build` then `next start` on a
  spare port — it needs no per-request compile and it is the
  built output that gets exercised, which is the stronger
  check.
- `ws` is available in this project's `node_modules`, so a raw
  CDP driver needs no Puppeteer or Playwright install (neither
  is present). Launch Chrome from
  `C:\Program Files\Google\Chrome\Application\chrome.exe` with
  `--headless=new` and `--remote-debugging-port`, read the
  target from `/json/list`, and speak CDP over the socket.
- A backgrounded server started from a shell that later times
  out can survive as an orphan holding its port. Find the
  owning PID with `netstat -ano | grep ":<port>"` and
  `taskkill //PID <pid> //F` — note the doubled slashes, which
  stop Git Bash rewriting the flags as paths.
- **`PrismaClientKnownRequestError` is not a named export of
  the generated client.** It is reached through the `Prisma`
  namespace: `import { Prisma } from
  "@/app/generated/prisma/client"`, then `error instanceof
  Prisma.PrismaClientKnownRequestError`, which also narrows an
  `unknown` so `.code` is reachable. Importing it directly
  fails `TS2305`.
- **`createMany`/`createManyAndReturn` data is scalar-only**,
  so it cannot carry a nested `connect` and therefore cannot
  be scoped by a related model's column. Use `create` with
  `project: { connect: { id, ownerId } }` for an owner-scoped
  insert — `ProjectWhereUniqueInput` accepts `ownerId` as a
  filter alongside the unique `id` — and handle `P2025`, which
  is what a `connect` matching nothing reports.
- Clerk's `clerkClient` from `@clerk/nextjs/server` is a
  **function returning a promise** — `await clerkClient()` —
  not the client itself. `users.getUserList({ emailAddress:
  string[], limit })` resolves to `{ data: User[], totalCount
  }`, the `emailAddress` filter takes at most **100** entries
  and is a case-insensitive **partial** match, and a `User`
  exposes `fullName` (a getter), `username`, `imageUrl`, and
  `emailAddresses[].emailAddress`.
- Zod 4 chains a transform before validation with `pipe`:
  `z.string().trim().toLowerCase().pipe(z.email().max(254))`.
  `z.email()` is a top-level function in v4, not
  `z.string().email()`.
- **A harness can drive the real Prisma modules if it sets
  `DATABASE_URL` before importing them.** `lib/prisma.ts`
  reads it at module scope, so assign `process.env.DATABASE_URL`
  and then use a dynamic `await import(...)` — a static import
  is hoisted above the assignment and the client is built with
  the wrong URL. Write the harness as `.mts` and run it with
  `npx tsx`, which resolves the TypeScript generated client
  that a `.cjs` script cannot.
- `node --env-file=.env.local --import tsx script.mts` gives a
  harness the Clerk keys without any script reading an env file
  itself, which keeps secrets off the command line and out of
  the console.
- When verifying against a provider holding real people's
  data, assert on **whether** a lookup resolved rather than
  printing what came back. A harness that logs an address, a
  name, or an avatar URL puts personal data in the transcript
  for no gain — `check("resolved", profiles.has(email))` proves
  the same thing.
