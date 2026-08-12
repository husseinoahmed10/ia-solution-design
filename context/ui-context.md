# UI Context

## Theme

Dark technical workspace. The interface should feel focused and professional rather than decorative. Use a near-black background, layered panels, clear borders, and one blue accent for primary actions.

Use the shadcn/ui CSS variable system in `app/globals.css`. Do not hardcode colours inside components.

## Colors

The application is dark only. The palette is defined once
in `:root` in `app/globals.css` with `color-scheme: dark`,
and the `dark` class stays on `<html>` so the `dark:`
variants inside the generated primitives resolve against
this same palette.

### Core palette

| Role | CSS variable | Value |
| --- | --- | --- |
| Page background | `--background` | `#09090B` |
| Panel background | `--card` | `#111113` |
| Elevated surface | `--popover` | `#18181B` |
| Primary text | `--foreground` | `#FAFAFA` |
| Muted text | `--muted-foreground` | `#A1A1AA` |
| Border | `--border` | `#27272A` |
| Primary action | `--primary` | `#3B82F6` |
| Destructive | `--destructive` | `#EF4444` |
| Success | `--success` | `#22C55E` |
| Warning | `--warning` | `#F59E0B` |

### Supporting tokens

The generated primitives also consume these tokens. They
are part of the shadcn/ui contract, so they must stay
defined even where the application does not use them yet.

| Role | CSS variable | Value |
| --- | --- | --- |
| Text on panels | `--card-foreground` | `#FAFAFA` |
| Text on elevated surfaces | `--popover-foreground` | `#FAFAFA` |
| Text on primary actions | `--primary-foreground` | `#FAFAFA` |
| Secondary surface | `--secondary` | `#18181B` |
| Text on secondary surface | `--secondary-foreground` | `#FAFAFA` |
| Muted surface | `--muted` | `#18181B` |
| Hover and active surface | `--accent` | `#27272A` |
| Text on accent surface | `--accent-foreground` | `#FAFAFA` |
| Text on destructive fill | `--destructive-foreground` | `#FAFAFA` |
| Text on success fill | `--success-foreground` | `#09090B` |
| Text on warning fill | `--warning-foreground` | `#09090B` |
| Input border | `--input` | `#27272A` |
| Focus ring | `--ring` | `#3B82F6` |

### Derived brand tokens

The auth brand panel needs a surface that is clearly
distinct from `--background` without introducing a second
accent colour. These tokens are therefore **mixed from
`--primary`** with `color-mix(in oklab, …)` rather than
given literal values, so the tint follows the accent instead
of drifting from it. Prefer this pattern over adding new hex
values when a surface is a variation on an existing one.

| Role | CSS variable | Definition |
| --- | --- | --- |
| Brand panel surface | `--brand-panel` | `--primary` 15% into `--background` |
| Brand panel border | `--brand-panel-border` | `--primary` 28% into `--border` |
| Tinted icon surface | `--brand-surface` | `--primary` 22% into `transparent` |

They are exposed to Tailwind in `@theme inline` as
`bg-brand-panel`, `border-brand-panel-border`, and
`bg-brand-surface`.

Sidebar tokens (`--sidebar`, `--sidebar-foreground`,
`--sidebar-primary`, `--sidebar-accent`,
`--sidebar-border`, `--sidebar-ring`) mirror the core
palette. The `--chart-*` tokens remain at their generated
neutral values and should be revisited if charts are added.

Canvas component colours may vary by component category, but they must be defined in one shared token map rather than inside individual components.

## Typography

| Role | Font | Variable |
| --- | --- | --- |
| Interface text | Geist Sans | `--font-geist-sans` |
| Technical values | Geist Mono | `--font-geist-mono` |

Both are loaded with `next/font/google` in
`app/layout.tsx`, which sets the two variables on `<html>`.
`app/globals.css` maps `--font-sans`, `--font-heading`, and
`--font-mono` onto them in `@theme inline`, and `html` gets
`@apply font-sans`, so Geist Sans is inherited everywhere
without a per-component font class.

Use normal sentence case. Avoid excessive uppercase labels.

### Scale

Hierarchy comes from size and weight on the same family,
not from a second typeface.

| Role | Classes |
| --- | --- |
| Panel headline | `text-4xl font-semibold tracking-tight` |
| Section and card title | `text-base font-semibold tracking-tight` |
| Body copy | `text-base` or `text-sm leading-relaxed` |
| Supporting label | `text-sm font-semibold tracking-tight` |
| Footnote | `text-xs` |

Tighten `tracking-tight` on headings and semibold labels
only — Geist already sits comfortably at body sizes. Use
`text-balance` on headlines and `text-pretty` on paragraphs
so wrapping stays even.

Clerk's components default to a `0.8125rem` base, which
reads smaller than the surrounding interface, so
`lib/clerk-appearance.ts` sets `fontSize: "0.875rem"` to
match the application's `text-sm`. Clerk derives its own
xs–xl steps from that one value.

## Border Radius

Radius is derived from a single `--radius` token, set to
`0.625rem` in `app/globals.css`. The `rounded-*` scale in
`@theme inline` is calculated from it, so changing
`--radius` rescales the whole interface.

These are the values the generated shadcn/ui primitives
already use. Match them in application components rather
than choosing a different radius.

| Context | Class |
| --- | --- |
| Buttons, inputs, and textareas | `rounded-lg` |
| Small and extra-small buttons | `rounded-[min(var(--radius-md),12px)]` and `rounded-[min(var(--radius-md),10px)]` |
| Tab list | `rounded-lg` |
| Tab trigger | `rounded-md` |
| Cards and panels | `rounded-xl` |
| Dialogs | `rounded-xl` |
| Scrollbar thumb | `rounded-full` |

Do not restyle a primitive purely to change its radius.

## Component Library

Use shadcn/ui components on top of Tailwind CSS. Add components with the shadcn CLI and keep generated files in `components/ui/` unchanged unless a feature explicitly requires a modification.

Use Lucide React for icons.

### Installed configuration

The project is configured in `components.json` with the
`radix-nova` style: the Radix base with the Nova preset,
which pairs Lucide icons with Geist. CSS variables are
enabled and the base colour is neutral. Keep new
components on this style so they stay visually consistent.

`app/globals.css` imports `shadcn/tailwind.css`, so the
`shadcn` package is a runtime styling dependency, not only
a CLI tool.

Note that `shadcn init` overwrites `app/globals.css` with a
default light and dark palette. If the CLI is re-run, the
palette above must be re-applied.

### Currently available primitives

`Avatar`, `Button`, `Card`, `Dialog`, `Input`, `Tabs`,
`Textarea`, and `ScrollArea`. Add further primitives with the
CLI when a feature needs them rather than writing custom
versions.

`Avatar` is composed of three parts: `AvatarImage` for a
resolved image, `AvatarFallback` for initials, and the
`Avatar` wrapper carrying the size. Render `AvatarImage` only
when there is a URL — the fallback is the normal state for
someone whose profile could not be resolved, not an error.

These primitives use the Radix composition API, so compose
a trigger with `asChild` rather than a `render` prop:

```tsx
<DialogTrigger asChild>
  <Button variant="outline">Open</Button>
</DialogTrigger>
```

Merge incoming class names with the `cn()` helper from
`lib/utils.ts` so callers can override styles predictably.

## Clerk Components

Clerk's pre-built components are themed once, in `lib/clerk-appearance.ts`, and
passed to `ClerkProvider` in `app/layout.tsx`. Individual pages do not restyle
them.

The base is Clerk's `dark` theme from `@clerk/ui/themes`. Every override is a
`var(--token)` reference to the palette above, never a literal colour, so Clerk
surfaces follow the same tokens as the rest of the interface — `--card` for the
card, `--secondary` for inputs, `--primary` for the submit button, `--radius`
for the shape, and the Geist font variables for type.

Keep Clerk's default user menu and profile flows as built. Do not rebuild them.

## Auth Pages

Sign-in and sign-up share one layout: a split screen, kept professional rather
than decorative — no gradients, no imagery, no feature cards, and no page
scrolling.

- **Large screens (`lg` and above)** — two exactly equal halves. Both grid
  tracks are `minmax(0, 1fr)`, so neither half can widen itself to fit its
  content and the split stays 50/50 at every width.
  - The **left half** is the brand panel on `bg-brand-panel`, with a
    `border-brand-panel-border` edge, so it reads as a tinted surface against
    the near-black `--background` the form sits on. It is a three-part column
    (`justify-between`): the wordmark at the top, the headline block and
    feature list in the middle, and a quiet footnote at the bottom.
  - Each feature is a row: a `size-9` `rounded-lg` `bg-brand-surface` square
    holding a `text-primary` Lucide icon, then a semibold title with a muted
    description beneath it.
  - The **right half** holds the centred Clerk form on `--background`, so the
    card reads as a raised `--card` surface.
- **Below `lg`** — the brand panel is dropped with `hidden lg:flex` and only
  the centred form remains.

## Main Layout

The application uses two main views.

### Project list

- Top navigation with product name and user menu.
- Search and new-project action.
- Responsive project cards or table.

### Project workspace

- Top bar with project name, lifecycle state, save status, and primary action.
- Left sidebar for documents, requirements, questions, architecture versions, findings, and outputs.
- Centre workspace for the selected view, including the architecture canvas.
- Right properties panel when a requirement, component, or finding is selected.

On smaller screens, side panels become drawers. The canvas is primarily designed for desktop use.

### Editor canvas

The canvas region is a flex container and `<main>` is
`min-h-0 flex-1`, so page content can fill it. Do not use a
percentage height such as `h-full` on `main` — the region is
itself a flex item with an auto height, so the percentage
does not resolve and the content collapses to its own height.

The editor home — what a user sees before a project is open —
is centred, plain, and **not** wrapped in a card: a
`text-4xl` headline, a short muted paragraph, and the single
primary action.

With a project open, the canvas region holds the centred
canvas placeholder on `--background`, so the navbar and the
two `--card` side panels read as chrome layered over it. The
architecture canvas will be mounted in the same region.

### Workspace navbar

The navbar has three equal sections. The left one carries the
project sidebar toggle; the centre shows the open project's
**name** as a truncating `text-sm font-semibold` heading; the
right holds the project actions and then Clerk's user menu.

The project name and the project actions — share and the AI
sidebar toggle — appear **only when a project is open**, so
the editor home shows the sidebar toggle and the user menu
alone. The name comes from the project lists the editor layout
already fetched, matched on the route's ID, so there is no
second query for it and the chrome shows no name for a project
the server refused.

An action whose behaviour is not implemented yet is rendered
`disabled` rather than wired to a no-op, so the control is
visibly not ready instead of appearing broken.

Share opens for a collaborator as well as an owner. The button
does not predict what the user may do — the dialog asks the
server and renders the management controls from that answer —
so a collaborator gets a read-only list rather than a refusal.

### Share dialog

The share dialog lists everyone with access to the open
project, one row each: an `Avatar` showing the person's Clerk
image or their initial, their display name with the email
beneath it in `text-xs text-muted-foreground`, and — for an
owner only — a remove button.

Someone with no resolvable Clerk profile shows their **email
alone**, with the initial taken from it. This is the normal
state for an invitee who has not signed up yet, so it is
rendered as ordinary content and not as a missing value.

An owner also gets an invite field above the list; a
collaborator gets the list and nothing else, and the remove
buttons are **absent from the DOM** rather than disabled,
matching the sidebar rows. Which controls appear comes from
the server's `canManage`, never from a comparison the browser
makes.

The list covers all four states from the interaction rules:
loading while it is fetched, a `role="alert"` error if the
fetch fails, the rows themselves inside a `max-h-56`
`ScrollArea`, and a line explaining that only the owner has
access when there are no collaborators yet.

The footer carries a `mr-auto` copy-link button, left of the
close action, which swaps its icon and label to `Copied!` for
two seconds. It is deliberately **not** a submit, so copying a
link does not dismiss the dialog the user is still working in.

### AI design assistant panel

The right-hand panel mirrors the project sidebar's overlay
mechanics: a positioned `<aside>` inside the canvas region on
`bg-card` with a `border-l`, sliding between
`translate-x-full` and `translate-x-0`, and `inert` plus
`aria-hidden` while closed so its controls stay out of the tab
order. Opening it therefore never reflows the canvas.

It opens and closes from the navbar toggle, which is also
where it is scoped: the panel is mounted only with a project
open, so leaving a workspace cannot strand an open panel with
no control left to close it.

### Access denied

A workspace the user may not open renders a centred column in
the canvas region: a `size-12` `rounded-xl` `bg-muted` square
holding a muted lock icon, a `text-2xl` heading, one muted
line, and an outline button back to `/editor`. The message
does **not** say whether the project is missing or merely not
shared, because distinguishing them would confirm that another
user's project exists.

### Project sidebar

Projects are split across the two tabs by access: owned
projects under `My Projects`, collaborator projects under
`Shared`. Each row shows its rename and delete actions on
hover **and** on keyboard focus (`group-hover` plus
`group-focus-within`), and a row the user does not own
renders no actions at all rather than hiding them.

The project **name is the link** that opens the workspace at
`/editor/[projectId]` — this is how a project is opened, and
it is what the editor home's "choose a project from the
sidebar" refers to. The row for the open project is marked
`aria-current="page"` and rendered in `--foreground`, while
the others sit in `--muted-foreground`, so the open workspace
is identifiable without a second surface colour.

Below `sm` an open sidebar is backed by a scrim that dims the
canvas and closes the panel when tapped. There is no scrim at
`sm` and above, where the panel is a non-blocking overlay and
the canvas stays clickable.

## Dialogs

Every editor dialog is built on `EditorDialog`, which wraps
the `Dialog` primitive with a title, an optional description,
a body, and footer actions.

- The footer is cancel plus one primary action. `DialogFooter`
  already provides the border, the `bg-muted/50` strip, and
  `justify-end`, so it needs only the buttons. Cancel is an
  outline `Button` inside `DialogClose asChild`, so
  dismissing requires no state.
- A dialog with an input wraps it in a `<form>` and gives the
  footer button `type="submit"` with a matching `form`
  attribute, so Enter submits from the field.
- A destructive confirmation carries no input. The project or
  record is already identified by the action that opened it,
  and the confirm button uses `variant="destructive"`.
- Name the affected record in the description rather than in
  the title, so the title stays a stable label.

## Interaction Rules

- Always show loading, empty, success, and error states.
- Use confirmation dialogs for destructive actions.
- Do not rely on colour alone to communicate status.
- Keep the primary action for the current stage visually clear.
- Use tooltips for unfamiliar WorkHQ and Blue Prism component icons.
