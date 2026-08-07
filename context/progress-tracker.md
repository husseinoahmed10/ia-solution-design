# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- In progress

## Current Goal

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

## Verified End to End

Units 01–07 were driven through a real signed-in Chrome
session over CDP (2026-08-06). Two substitutions were needed,
neither of which changes what the application executed:

- **Database:** the project database is still unreachable
  (`P1001`, see **In Progress**), so the migration was applied
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

- **Apply the migration to the project database.** The
  migration is committed and now proven to apply with zero
  drift, but the configured database has still never received
  it. Port 5432 on `pooled.db.prisma.io` accepts a TCP
  connection and then never answers the Postgres startup
  handshake, so the CLI fails with `P1001`. Re-confirmed
  2026-08-06 by sending the 8-byte `SSLRequest` frame by hand:
  the same host answers on 443, and DNS resolves, so it is a
  network block rather than a credential or schema problem. Run
  `npx prisma migrate deploy` from a network that permits
  outbound 5432, or use the Prisma Postgres
  `prisma+postgres://` Accelerate URL, which travels over 443.
  Nothing in the code needs to change.
- **Set a real `LIVEBLOCKS_SECRET_KEY`.** The adapter is proven
  correct against a stub, but no room has been created on
  Liveblocks' own servers. Only the key is missing.

## Next Up

- Collaborator **management**. The `Shared` tab is now real —
  `listProjectsForCollaborator` reads `ProjectCollaborator`
  rows by email — but nothing **writes** them, so the tab can
  only ever be empty until an invite flow exists. A room's
  `usersAccesses` also grants the owner alone, so a
  collaborator would currently be unable to enter the room.
  Both belong to an invite specification.
- `GET /api/projects` still returns owned projects only. The
  sidebar no longer uses it — the layout calls the services
  directly — so it is now only an unused public surface.
  Decide whether it should return both lists or be removed.
- The project workspace itself.
  `app/(editor)/editor/[projectId]/page.tsx` exists with the
  real access check but shows only the project name. The
  canvas, the Liveblocks client provider, and the room
  authentication endpoint are all still to come.
- Centre workspace and right properties panel, per the
  Main Layout section of `ui-context.md`, once their
  feature specifications exist.

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
  `components/`.** The dialogs, the sidebar row, the slug
  helper, and the dialog hook all carry project domain
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
  affordance only: it is not an access control, and the
  server-side ownership check required by invariant 6 still
  has to be written when the mutations land.
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
- **Radius follows the generated primitives.** The earlier
  `ui-context.md` radius table conflicted with the shadcn
  defaults. Rather than restyle protected files in
  `components/ui/`, `ui-context.md` was updated to document
  the generated scale, and `--radius` was returned to the
  generated `0.625rem`. Application components now match
  the primitives instead of diverging from them.

## Session Notes

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
- Outbound TCP 5432 is blocked on this network in a way that
  looks like a working connection: the handshake completes at
  the TCP layer and then the server never replies to the
  Postgres `SSLRequest`, so clients report a generic timeout
  and Prisma reports `P1001`. Confirming it took sending the
  8-byte `SSLRequest` frame manually and comparing against
  port 443 on the same host, which answers. Suspect the
  network before the credentials when a Prisma Postgres
  `postgres://` URL times out.
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
- Node resolves `require()` from the **script's own** directory,
  so a harness kept outside the repository cannot `require("pg")`
  from the project's `node_modules`. Pass an absolute path, or
  keep the script inside the project and delete it afterwards.
