# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- In progress

## Current Goal

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
- **Set a real `LIVEBLOCKS_SECRET_KEY`.** The adapter is proven
  correct against a stub, but no room has been created on
  Liveblocks' own servers, and the key is **absent from both
  `.env` and `.env.local`** (re-checked 2026-08-10). Until it is
  set, `POST /api/projects` cannot succeed: the room create
  throws, the route deletes the project row again, and the
  request fails — verified by executing `createProjectRoom`
  with the key unset, which throws the module's own
  "LIVEBLOCKS_SECRET_KEY is not set" error. Creating a project
  in a real environment therefore depends on this key, not just
  on the database.

## Next Up

- **Grant a collaborator access to the Liveblocks room.**
  Unit 09 closed the invite half of this — the `Shared` tab is
  now reachable, because the share dialog writes
  `ProjectCollaborator` rows — but `createProjectRoom` still
  grants `room:write` to the **owner alone**, so an invited
  collaborator can open the workspace and yet could not enter
  the room once the canvas is live. Two parts remain: granting
  a room accesses entry on invite (and revoking it on
  removal), and the room authentication endpoint. A
  collaborator is identified by email while Liveblocks wants a
  user ID, so an invitee who has not signed up yet cannot be
  granted anything at invite time — the grant probably belongs
  in the auth endpoint, resolved per session, rather than in
  the invite route. Decide that when the canvas lands.
- **A removed collaborator keeps an open tab working.**
  Removal deletes the row, but a collaborator already inside
  the workspace holds a rendered page; nothing revalidates for
  them, so their next navigation is the first thing the access
  check sees. Acceptable now, since the canvas is a
  placeholder and nothing is written from that page, but it
  needs a real answer once the canvas can be edited.
- `GET /api/projects` still returns owned projects only. The
  sidebar no longer uses it — the layout calls the services
  directly — so it is now only an unused public surface.
  Decide whether it should return both lists or be removed.
- **The architecture canvas.** The workspace shell is now
  complete — navbar, project sidebar, canvas region, and the
  AI panel placeholder — so what remains for
  `/editor/[projectId]` is the canvas itself: `@xyflow/react`,
  the component and connection models, the Liveblocks client
  provider, and the room authentication endpoint.
- **The AI design assistant.** The right panel is a
  placeholder with no chat, no model call, and no state beyond
  being open. It needs the Vercel AI SDK wiring, the
  structured-output schemas, and the generation flow.
- Lifecycle state and save status in the workspace navbar,
  and the right properties panel for a selected requirement,
  component, or finding, per the Main Layout section of
  `ui-context.md`, once their feature specifications exist.

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
- **Radius follows the generated primitives.** The earlier
  `ui-context.md` radius table conflicted with the shadcn
  defaults. Rather than restyle protected files in
  `components/ui/`, `ui-context.md` was updated to document
  the generated scale, and `--radius` was returned to the
  generated `0.625rem`. Application components now match
  the primitives instead of diverging from them.

## Session Notes

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
