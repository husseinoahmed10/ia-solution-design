# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- In progress

## Current Goal

- Unit 02 — Editor chrome
  (`context/feature-specs/02-editor.md`) — complete.
  Awaiting the next feature specification.

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
