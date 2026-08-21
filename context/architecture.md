# Architecture Context

## Stack

| Layer | Technology | Role |
| --- | --- | --- |
| Framework | Next.js 16, React 19, TypeScript | Full-stack web application |
| UI | Tailwind CSS, shadcn/ui, Lucide React | Styling and reusable interface components |
| Canvas | `@xyflow/react` | Interactive solution architecture canvas |
| Authentication | Clerk | User sign-in and route protection |
| Collaboration | Liveblocks | Project workspace rooms, keyed by project ID |
| Database | PostgreSQL with Prisma | Projects, documents, requirements, designs, findings, and output metadata |
| File storage | Vercel Blob | Uploaded source files and generated build-pack files |
| Background jobs | Trigger.dev | Document extraction, AI generation, validation, and build-pack tasks |
| AI | Vercel AI SDK with Google Gemini | Structured requirement and design generation |
| Validation | Zod | Runtime validation for API input, task payloads, stored JSON, and AI output |
| Document parsing | `pdfjs-dist`, `mammoth`, `exceljs` | PDF, DOCX, and XLSX text extraction |
| Markdown | `react-markdown` | Build-pack preview in the application |
| Testing | Vitest and Playwright | Unit, integration, and end-to-end tests |

Authentication, storage, and AI calls must be isolated behind small service modules so they can be replaced later if SS&C requires different providers.

## System Boundaries

- `app/` — routes, layouts, server components, and route handlers.
- `components/` — reusable UI and feature components. Do not place database or provider logic here.
- `features/` — project, document, requirement, canvas, standards, and build-pack domain logic. `features/canvas/` holds what a canvas is drawn *from* — the component catalogue, the shared token maps, the node and edge renderers, and the toolbar — while `features/collaboration/` holds the room and the React Flow instance the canvas lives *in*.
- `lib/` — shared infrastructure such as Prisma, authentication, storage, AI, and validation helpers.
- `trigger/` — long-running Trigger.dev tasks only.
- `prisma/` — database schema and migrations.
- `context/` — persistent project context and feature specifications.
- `liveblocks.config.ts` at the project root — the global Liveblocks type declaration. It sits at the root because Liveblocks' own tooling expects it there, alongside `proxy.ts` and `prisma.config.ts`.
- `types/` — shared type contracts that more than one boundary reads, such as `types/canvas.ts`, which both `liveblocks.config.ts` and the canvas components import. A type belonging to one feature stays in that feature module.

## Storage Model

- **PostgreSQL** stores structured data and relationships: projects, users, document metadata, extracted sections, requirements, requirement sources, architecture versions, components, connections, findings, task runs, and generated-output metadata.
- **Vercel Blob** stores original uploaded files and generated Markdown or JSON files.
- Large files are not stored directly in PostgreSQL.
- The database stores the blob URL, file name, checksum, size, type, and project relationship.

## Authentication and Access

- Every protected page and mutation requires an authenticated Clerk user.
- Every project has an owner.
- Project access is checked on the server before reading or changing project data.
- Browser-supplied project IDs are never trusted without a server-side access check.

### Page access checks

- **`lib/project-access.ts` is the page-level access helper.** `getCurrentIdentity()` reduces the Clerk session to a `userId` and a nullable primary email — the two values a decision needs — and `resolveProjectAccess(projectId)` answers `unauthenticated`, `denied`, or `granted` with the project.
- It lives in `lib/` because it composes the Clerk provider with a feature query; the query itself stays in `features/projects/project-service.ts`. The access logic is kept out of the page component, so a page decides only what to *render* for each outcome.
- Route handlers keep their own helper: `features/projects/project-access.ts` returns `owner`/`forbidden`/`missing`, because an API must distinguish `403` from `404`. A page must not, so `resolveProjectAccess` deliberately collapses both to `denied` — telling them apart in the UI would confirm that another user's project exists.
- A page renders `AccessDenied` for `denied` rather than calling `notFound()`, so the user keeps the editor chrome and a route back. `unauthenticated` redirects to the sign-in path from `lib/auth-routes.ts`.

### Collaborator identity

- **A collaborator is identified by email address.** There is no local `User` table — Clerk owns the user store — so a `ProjectCollaborator` row holds an email, and an invitee may have no Clerk account at all.
- **Every email is lower-cased, in exactly one place per direction:** the invite schema on the way in, and `getCurrentIdentity()` in `lib/clerk-identity.ts` on the way out. Postgres compares case-sensitively and this column *is* the identity, so a mixed-case row would match nothing — the project would silently never appear in `Shared` — and `@@unique([projectId, email])` would accept the same person twice. Do not build an email filter anywhere else.
- **`lib/clerk-users.ts` is the only module that asks Clerk who someone is.** It resolves a batch of emails to display names and avatars in one call per 100 addresses, which is Clerk's filter limit.
- **Clerk display data is enrichment, not the source of truth.** A failed lookup returns no profiles rather than throwing, so the collaborator list still renders from this application's own database with emails alone. Who has access is a fact this application owns; the name beside it is decoration from a provider that may be unavailable. The same fallback covers an invitee who never signed up, so there is one path rather than two.
- Clerk's `emailAddress` filter is a case-insensitive **partial** match and can return users that were not requested, so results are keyed by each returned user's own addresses. Keying them by the requested address would attach one person's identity to another person's row.

### Clerk wiring

- `ClerkProvider` wraps the root layout from inside `<body>`, which the Next.js SDK requires.
- `proxy.ts` at the project root holds `clerkMiddleware`. Next.js 16 renamed `middleware.ts` to `proxy.ts`; there is no `middleware.ts`.
- The proxy is **protected-first**: it calls `auth.protect()` for every page path that is not a public auth path, so a new page route is protected without editing the proxy.
- `lib/auth-routes.ts` is the single source for the public paths. It reads `NEXT_PUBLIC_CLERK_SIGN_IN_URL` and `NEXT_PUBLIC_CLERK_SIGN_UP_URL` so the proxy, the `/` redirect, and Clerk's own redirects cannot drift apart.
- **`/api` is excluded from `auth.protect()` and is not public.** `protect()` only redirects a request Clerk recognises as a page — it inspects `Sec-Fetch-Dest` and `Accept` — and answers anything else by rewriting to a 404. Under the proxy, an unauthenticated API call would return `404` and no handler would run, so `401` would be unreachable. `isApiPath()` in `lib/auth-routes.ts` marks these paths, and every route handler authenticates itself. A route handler added later inherits no protection from the proxy.
- The proxy is the coarse gate only. Clerk deprecated `createRouteMatcher` because path matching in a proxy can diverge from how Next.js resolves a request, so it does not replace the server-side access checks required by invariant 6. Read auth with `await auth()` in the page, layout, route handler, or server function that touches protected data.

### Route handler conventions

- Read the caller with `getRequestUserId()` from `lib/api-auth.ts`. No signed-in user is `401`.
- Validate the body with a Zod schema from the feature module. A malformed or invalid payload is `400`.
- Check access before mutating. A project that does not exist is `404`; one owned by another user is `403`. Scope the mutation by `ownerId` as well, so the statement cannot touch another user's row if ownership changes between the check and the write.
- Return JSON through the helpers in `lib/api-response.ts`, so every error shares the `{ error }` shape. `201` for a create, `204` with no body for a delete, `409` for a request that conflicts with existing state — an invite for someone who already has access, rather than a `400`, because the payload was valid. `500` through `configurationErrorResponse` when the server is missing configuration the request needs: the caller has nothing to correct, so it is not a `4xx`.
- **A read a collaborator is allowed to perform uses `resolveProjectAccess`, not the ownership check**, and returns what the caller may *do* alongside the data — `GET …/collaborators` sends `canManage` with the list. The client renders its controls from that flag instead of comparing IDs itself, and the write routes re-check ownership regardless.
- Select an explicit field list for responses rather than returning a Prisma model, so a column added later is private until it is deliberately exposed.
- `/` owns no content. It reads `await auth()` and redirects to `/editor` when authenticated and to the sign-in path when not.
- Required environment variables: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, and `NEXT_PUBLIC_CLERK_SIGN_UP_URL`. Do not rename or add to these.

## Project Workspace Identity

- **A project has exactly one identifier: its `Project.id`.** That same value is the workspace route segment (`/editor/[projectId]`) and the Liveblocks room ID. The three can never drift apart because there is only one of them.
- **Identifiers are never derived from a project name.** There are no slugs and no short unique suffixes anywhere in the application. A rename therefore changes the name only — the ID, the route, and the room are untouched — and there is no rename operation on a room.
- The ID is assigned by the database (`@default(uuid(7))`), so a create writes the row first and names the room from the returned ID. Application code generates no identifiers.
- **Liveblocks is reached only through `lib/liveblocks.ts`**, per the isolation rule above. The client is built on first use rather than at import, so a missing key fails the request that needs it instead of the build. A missing key throws `LiveblocksNotConfiguredError`, a distinct type, so a caller can answer with a configuration error rather than masking a deployment fault as a refusal or a missing room.
- Creating a project creates its room; deleting a project deletes its room. A create whose room fails deletes the project row again, so no response reports a workspace the user cannot open. A delete removes the room first, because once the row is gone nothing records which room belonged to it.
- **A room failure is assumed to be ambiguous.** A timeout or a lost response may mean the room was created and only the acknowledgement failed, so compensation never assumes the room is absent: it deletes the room before the row, and room deletion tolerates a `404`. Because the room ID is the project ID, the row is what makes the room addressable — so if the compensating room delete *also* fails, the row is kept rather than deleted, leaving the pair recoverable by a later delete instead of stranding a room no identifier points at.
- Required environment variable: `LIVEBLOCKS_SECRET_KEY`. `LIVEBLOCKS_BASE_URL` is optional and only points the client at an alternative server.

### Realtime collaboration

- **`liveblocks.config.ts` at the project root is the single type definition for the collaboration layer.** It declares the global `Liveblocks` interface, so every hook and every server call reads `Presence` and `UserMeta` from one place. `Presence` holds a nullable `cursor` and an `isThinking` flag; `UserMeta.info` holds a `name`, a nullable `avatar`, and a `color`. `Storage` has one key, an **optional** `flow`, holding the canvas — see **Collaborative canvas** below.
- A module that imports the `Liveblocks` **class** from `@liveblocks/node` shadows that global interface, so the config also exports `ProjectUserInfo` as a named alias for `UserMeta["info"]`. Import the alias rather than restating the shape.
- **`POST /api/liveblocks-auth` is the room authentication endpoint.** The Liveblocks client posts `{ room }`, where the room ID is the project ID. The value is caller-supplied, so the route resolves it through `resolveProjectAccess` before minting anything: an owner and a collaborator both pass, and everybody else gets `403`. An unauthenticated caller gets `401`.
- **The session grants the requested room and nothing else** — `session.allow(projectId, ["*:write"])`, with no trailing `*` and no shared prefix — so a token for one workspace cannot open another project's room. Never widen this to a pattern.
- **A room's permissions are not stored on the room.** `ensureProjectRoom` creates a room with `defaultAccesses: []` and no `usersAccesses`, and access is granted per session by the auth endpoint instead. A grant baked into the room would outlive this application's own access check, so a removed collaborator would keep a permission the database no longer supports.
- `ensureProjectRoom` uses `getOrCreateRoom`, which leaves an existing room and its permissions untouched. A project created while Liveblocks was unreachable therefore heals on the next authentication rather than needing a migration.
- **The user's identity on a session is set server-side**: the Clerk user ID identifies it, and the name, avatar, and colour are read from Clerk in the route, never accepted from the client. A display name falls back through Clerk's own fields — full name, username, the local part of the primary email, then a fragment of the user ID — so it always resolves without inventing anything.
- **`lib/liveblocks-cursor-color.ts` maps a Clerk user ID to a colour deterministically**, with FNV-1a over a fixed eight-value palette. The same user is the same colour in every room and in every session, with nothing stored. The values are literal hex rather than `var(--token)` references, because a cursor colour is data that travels to other clients where a CSS variable could not resolve.
- If `LIVEBLOCKS_SECRET_KEY` is absent, the auth route answers `500` with a clear configuration message rather than failing opaquely. It is the one `5xx` any route returns deliberately, through `configurationErrorResponse`.

### Collaborative canvas

- **Liveblocks Storage is the only home for canvas state.** There is no PostgreSQL or blob copy of the nodes and edges, so there is one writable canvas per project and nothing to reconcile. `ArchitectureVersion`, `ArchitectureComponent`, and `ArchitectureConnection` remain in the domain records above for the approved-version model, which is a separate concern from the live canvas.
- **`@liveblocks/react-flow`'s `useLiveblocksFlow` owns the React Flow state.** It is the controlled-flow pattern: the nodes and edges it returns come from Storage and its handlers write back to it, so there is no local `useNodesState` and no second copy of the diagram. Do not add one.
- **`Storage.flow` is typed from the canvas' own node and edge types**, `CanvasNode` and `CanvasEdge` in `types/canvas.ts`, rather than hand-modelled — the hook stores a `LiveObject` of two `LiveMap`s under its default `"flow"` key, and describing that from the React Flow types is what keeps the document and what is rendered from drifting apart.
- **The key is optional**, for two reasons: a room nobody has opened has no `flow` yet and the hook creates it on first load, and a required key would make `initialStorage` a required `RoomProvider` prop — a second, competing initialiser for the same tree.
- **`types/canvas.ts` holds the shared canvas types**, at the project root alongside `liveblocks.config.ts`, because both the config and the canvas components read them. `CanvasNodeData` is a `type` alias rather than an `interface`, against the usual rule: React Flow constrains node data to `Record<string, unknown>`, which an alias satisfies through its implicit index signature and an interface does not.
- **`types/canvas.ts` stays type-only.** It declares the `CanvasComponentType`, `CanvasNodeShape`, and `CanvasNodeColor` unions; the values those unions index — the component catalogue, the sizes, and the colours — live in `features/canvas/`, so nothing in `types/` reaches into a feature module.
- **`features/canvas/canvas-components.ts` is the component catalogue**, and the only place a component's display name, icon, and shape are decided. The toolbar renders it and the drop handler looks up through it, so a component added there needs no other change. `features/canvas/canvas-node-tokens.ts` is the shared token map `ui-context.md` requires: every size and every colour a node is drawn with comes from it, and `features/canvas/canvas-edge-tokens.ts` is its sibling for connections — every stroke, opacity, dimension, and marker an edge is drawn with — and `features/canvas/canvas-control-tokens.ts` is the third, holding the control bar's offset, the viewport animation duration, and the shared fit-view options. Three files, because nothing in one is a measurement of another.
- **A stored `componentType` is an identifier, not display text.** The label a user sees comes from the catalogue, so renaming a component in the interface does not rewrite the nodes already in Storage, and a node whose stored type has since left the catalogue still renders from its own stored label and shape.
- **The drag payload from the toolbar to the canvas is validated with Zod.** Both ends are this application, but they are joined by `DataTransfer` — a browser channel carrying a string — so what reaches the drop handler is genuinely unknown input. It is set under a custom MIME type, so a dragged file, link, or text selection cannot be mistaken for a component, and a payload that fails validation is a **no-op rather than an error**: nothing was changed and the user has nothing to correct.
- **A dropped component is added through `onNodesChange`**, as an `add` change, because `useLiveblocksFlow` owns the state — that handler is what writes into the room's `flow` tree, so a new node is in Storage and broadcast as soon as it lands. Nothing calls `setNodes`.
- **A connection is created only through `useLiveblocksFlow`'s `onConnect`**, and there is **one edge model** — `CanvasEdge`, rendered by the single `canvasEdge` type in `features/canvas/canvas-edge.tsx`. What a new edge resolves to (its type, an empty label, its arrowhead) is React Flow's own `defaultEdgeOptions`, merged into the connection before that handler runs, so there is no second edge-creation path and no per-edge repetition of the defaults. A label is changed through `updateEdgeData`, which React Flow diffs into a `replace` change on `onEdgesChange` — the same Liveblocks mutation. Do not add a local edge store, and do not add a second edge type for a different kind of connection.
- **`features/canvas/canvas-node-body.tsx` is the one drawing of a component**: the shape outline with its label over it. The `canvasNode` renderer composes it and adds what belongs to a *node* — React Flow's measured size, its selected state, and the connection handles — and the toolbar's drag preview composes the same body at the payload's size. One appearance, two mountings, so the ghost that is dragged and the node that lands cannot drift apart.
- **The drag preview is client-local state and must stay that way.** `hooks/use-canvas-drag-preview.ts` holds the in-flight payload and the pointer position in React state; nothing about it is written to Liveblocks Storage or to Presence. A preview is not part of the document — no node exists yet — and what somebody is *about* to drop is not information the room is shown. The one collaborative write is still the `add` change on drop.
- **A canvas node generates its own ID**, from its component type, `Date.now()`, a per-session counter, and a short random suffix. This is not an exception to the identifier rule above: that rule governs *records*, which the database names, and a canvas node is not a row — it exists only in the Liveblocks document, which no server writes to. All four parts are needed because the ID is a key in a `LiveMap` two clients write to concurrently, and a collision would overwrite one person's component with another's rather than adding a second node.
- **`ReactFlowProvider` is mounted above `<ReactFlow>` in `architecture-canvas.tsx`**, because converting a drop's screen position to canvas coordinates needs `screenToFlowPosition` from React Flow's store, and that store must exist in a component above the flow. `<ReactFlow>` reuses an existing store when it finds one, so there is still exactly one.
- **The client boundary is `features/collaboration/canvas-room.tsx`.** The workspace page stays a Server Component and resolves access; this is the first client component on the path, and it holds `LiveblocksProvider` (pointed at `/api/liveblocks-auth`), `RoomProvider` (keyed by the project ID), the loading state, and the error state. Joining a room is a browser concern, so it belongs no higher.
- **`authEndpoint`, never `publicApiKey`.** A room is joinable only by an owner or a collaborator, which needs a server-side check, so nothing about the Liveblocks account reaches the browser.
- **A connection failure is caught with `useErrorListener`, not a React error boundary.** The failure happens inside the Liveblocks client's connection state machine, not during render: the canvas is suspended waiting for Storage that never arrives, so nothing throws and the loading state would otherwise stay on screen indefinitely with the reason only in the console. Only a `ROOM_CONNECTION_ERROR` is treated as fatal — Liveblocks retries a transient problem silently, so an error that arrives has already exhausted its retries.
- The error screen names no cause and offers no retry. A refused token, a revoked access, and a server with no `LIVEBLOCKS_SECRET_KEY` are indistinguishable to the browser and none is fixed by trying again.
- **Undo and redo are Liveblocks' history and nothing else.** `features/canvas/canvas-control-bar.tsx` reads `useUndo`, `useRedo`, `useCanUndo`, and `useCanRedo` from the room. Every canvas change already goes through `useLiveblocksFlow`, so the room's history is a complete record of this client's edits and there is nothing to keep in step. **Do not add a second history stack, and do not use React Flow's local state as one** — that would be the second copy of the diagram the controlled-flow pattern exists to avoid, and it would undo a collaborator's change as readily as this client's.
- **History is paused, not bypassed, for a multi-keystroke edit.** A node or connection label session wraps `pause()`/`resume()` around itself so one rename is one undo step, and `@liveblocks/react-flow` does the same for a resize gesture itself. A pause is tracked per session before it is resumed, because the calls are not counted and an unbalanced `resume()` would commit a frame another gesture owns.
- **The viewport is client-local and is not persisted.** Zoom, pan, and fit view are React Flow's own viewport methods, called with a duration from `canvas-control-tokens.ts`, and nothing about them is written to Storage, to Presence, or to PostgreSQL. Nobody else's view moves, and opening a project starts from the initial fit. Collaborative viewport syncing is not a feature this canvas has.
- **`hooks/use-keyboard-shortcuts.ts` holds no canvas dependency.** The control bar passes it the viewport and history actions, so the hook imports neither React Flow nor Liveblocks and a key runs the same call as the button beside it. It listens on `window` — React Flow's viewport is not focusable — and ignores an event whose target is, or is inside, an `input`, `textarea`, `select`, or `contenteditable`, which is what keeps the label editors typable. It calls `preventDefault()` only on a keypress it handles, so `Cmd/Ctrl + =` and `Cmd/Ctrl + -` remain the browser's page zoom.

## Background and AI Model

- Normal request handlers validate input, check access, create task records, and trigger work.
- Long-running document extraction, AI generation, standards review, and build-pack generation run in Trigger.dev.
- Trigger.dev tasks receive IDs and references, not unrestricted client state.
- AI returns structured data validated with Zod before persistence.
- The application database is the source of truth; Markdown is a generated output.

## Core Domain Records

The initial domain will use these main records:

- `Project`
- `SourceDocument`
- `SourceSection`
- `Requirement`
- `RequirementSource`
- `OpenQuestion`
- `RequirementConflict`
- `ArchitectureVersion`
- `ArchitectureComponent`
- `ArchitectureConnection`
- `ComplianceFinding`
- `GeneratedOutput`
- `TaskRun`

Add fields and supporting records in the relevant feature specification rather than designing the entire schema in advance.

## Invariants

1. Request handlers must not perform long-running extraction or AI work.
2. Every requirement must retain at least one source reference unless it is explicitly marked as an assumption.
3. Every material architecture component must link to at least one confirmed requirement.
4. AI output must be validated before it is stored or applied to the canvas.
5. Approved architecture versions are immutable; changes create a new draft version.
6. Project access must be enforced server-side at every read and mutation boundary.
7. The application must not invent WorkHQ capabilities, Blue Prism capabilities, business rules, or SS&C standards.
8. The MVP generates designs and specifications only; it does not deploy WorkHQ or Blue Prism assets.
