# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- In progress

## Current Goal

- Unit 03 — Authentication
  (`context/feature-specs/03-auth.md`) — complete,
  including the auth-page visual refresh. Awaiting the next
  feature specification.

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

## In Progress

- None.

## Next Up

- The first concrete dialog (for example New Project)
  built on the dialog pattern, once its feature
  specification exists.
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
- In development Clerk answers the first request per
  browser with a 307 to its `/v1/client/handshake`
  endpoint to set the dev-browser cookie. Use a cookie jar
  (`curl -L -c jar -b jar`) or the redirect chain looks
  like it leaves the application.
