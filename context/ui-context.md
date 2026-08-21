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

### Collaborator cursor colours

`lib/liveblocks-cursor-color.ts` holds an eight-value palette
of **literal hex** values, which is the one deliberate
exception to the no-hardcoded-colours rule. A cursor colour is
*data*, not styling: it is attached to a Liveblocks session on
the server and travels to every other client, where a
`var(--token)` reference could not resolve. The set is also
larger than the interface palette, because its job is to tell
people apart.

The values are chosen to be distinct from `--primary`,
`--success`, `--warning`, and `--destructive`, so a
collaborator's colour is never read as the accent or as a
status. A colour is derived from the Clerk user ID, so the same
person is the same colour everywhere with nothing stored. Two
users in one room can still collide, which is why a name is
always shown alongside the colour and never replaced by it.

Sidebar tokens (`--sidebar`, `--sidebar-foreground`,
`--sidebar-primary`, `--sidebar-accent`,
`--sidebar-border`, `--sidebar-ring`) mirror the core
palette. The `--chart-*` tokens remain at their generated
neutral values and should be revisited if charts are added.

Canvas component colours may vary by component category, but they must be defined in one shared token map rather than inside individual components.

That map is `features/canvas/canvas-node-tokens.ts`. It holds
both halves of how a component is drawn: `canvasNodeShapeTokens`
gives every shape its default size and its label inset, and
`canvasNodeColorTokens` gives every colour name its surface,
border, selected border, and label colour. Neither the toolbar nor
the node renderer holds a dimension or a colour of its own — a
component that should look different is a new entry in that file.

There are five colour entries, the predefined themes a node can be
given from its colour toolbar: `default`, `blue`, `green`, `amber`,
and `red`. `default` is `--card` with a `--border` outline, the
surface every component starts on. The other four are **mixed from
palette tokens the interface already has** — `--primary`,
`--success`, `--warning`, and `--destructive` — following the
derived-token pattern above, so the canvas never grows a second
palette. A surface is the hue 20% into `--card`, a border is the hue
55% into `--border`, the selected outline is the hue itself, and a
label is `--foreground` carrying 14% of the hue, which pairs the
text with its surface without losing contrast on it.

**A node colour has no meaning.** It is a visual grouping the person
drawing the diagram chooses, and nothing in the application reads it
to decide anything: `red` is not an error and `green` is not a
completed state, and that a colour is mixed from `--destructive` is
a source for the hue and nothing more. Category or status colouring
is not what these are, and neither is specified yet.

A node in Storage carries only the colour **key**. Its background,
text, and border are resolved from that key through this map at
render time, so no node holds a colour value and recolouring one
cannot leave three fields disagreeing.

The colour tokens are `var(--token)` and `color-mix()` **strings**
rather than Tailwind classes, because the surface and border are
handed to SVG `fill` and `stroke` attributes, which cannot take a
class — and the label colour follows them, so one colour key
resolves through one mechanism rather than splitting across two.
They still resolve to the palette above, so no literal colour
appears in the map.

The map also holds `canvasNodeToolbarOffset`, the gap between a node
and its floating colour toolbar. It is a dimension, so it belongs
here rather than in the renderer.

The map also holds `canvasNodeStrokeWidths`, the two weights a node
is outlined with — `rest` and `selected`. A stroke width is a
dimension, so it belongs beside the sizes rather than inside the
shape renderer.

Each shape also carries a **minimum** width and height, the floor a
resize gesture stops at, for the same reason it carries a default
size: it is the shape that decides how much room a label needs, so a
hexagon — which loses both ends to its points — has a wider floor
than a rectangle of the same drawn width. A minimum is a dimension,
so it lives here and never as a number in the renderer.

Finally the map holds `canvasNodeResizeControlStyles`, how React
Flow's resize handles and edges are drawn. These are **inline
styles rather than Tailwind classes**, which is the one exception in
this file, and specificity forces it: `base.css` styles a control
through `.react-flow__resize-control.handle`, two classes, so a
single utility class on the same element loses and the handle keeps
its hardcoded white border. The values are still `var(--token)`
references, so no literal colour appears.

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

With a project open, the canvas region holds the architecture
canvas on `--background`, so the navbar and the two `--card`
side panels read as chrome layered over it.

The canvas itself is React Flow, which sets
`width: 100%; height: 100%` on its own wrapper and does not
let a caller override that through `style`. Filling the
workspace is therefore a matter of its **parent** resolving to
a height: a `h-full` wrapper inside the `min-h-0 flex-1`
region, which is the one place a percentage height does
resolve. Do not try to size the canvas itself.

`colorMode="dark"` is what puts React Flow into its dark
palette — the `--xy-*` dark values live behind
`.react-flow.dark` — and only `base.css` is imported, since
`style.css` styles the default node chrome and React Flow's
own `Controls` component, and neither is rendered: the canvas
control bar is this application's own `Panel`.

The dot-pattern background takes its colour as a `var(--token)`
reference to the palette above rather than a literal value,
passed through the prop React Flow forwards into its own CSS
variables.

**There is no MiniMap.** It was removed with the canvas control
bar: an overview of the whole diagram is a navigation aid for a
canvas larger than the viewport, which fit view now covers, and
keeping both would leave two overlays competing for the same
corners as the component toolbar.

Two non-canvas states share the same region and the same
centred column, differing only in icon and message: a spinner
and "Connecting to the canvas…" while the room is joined, and
a `role="alert"` line asking for a reload when it permanently
fails. The loading state is deliberately a spinner rather than
a skeleton — a skeleton of an empty canvas is a grid of dots,
which reads as a loaded canvas. The error message names no
cause and offers no retry, because the causes are
indistinguishable to the browser and none is fixed by trying
again.

### Canvas components

A component on the canvas is one basic shape with a border and a
centred label, and nothing else yet. The shapes are **this
application's own visual conventions for a high-level solution
design** — they do not reproduce the WorkHQ or Design Studio
interface, and a shape says nothing about what either product can
do. Six exist: rectangle, pill, circle, cylinder, hexagon, and
diamond, which has no toolbar component yet and is kept for
decision and branching components.

They are drawn as **one SVG per node**, sitting behind the label
inside the node's own box. CSS was not used: a hexagon, a cylinder,
and a diamond have no CSS border, and `clip-path` cuts an outline
off rather than stroking it, so half the shapes could not have
shown a border and the set would have needed two mechanisms.

The label is centred both ways over that outline and clamped to two
lines, so a long name wraps instead of spilling out of a shape that
cannot grow. Each shape carries its own label inset, because the
drawn outline is not the bounding box: a hexagon loses both ends to
its points, and a cylinder's label sits below its rim rather than
across it.

The default size belongs to the **shape**, not to the component,
since it is the shape that decides how much room a label needs.
Rectangles and pills are wider than they are tall, circles are
square, cylinders are wide enough for a label under the rim, and
hexagons are a little larger so text between the points stays
readable.

A node carries **four connection handles**, one per side, so a
component can be joined to another in whichever direction the
diagram reads. Each is a small `--foreground` dot with a
`--background` border, which reads as a grabbable point on every
colour theme. They are styled here rather than inherited:
`base.css` positions a handle but gives it no size or colour —
those rules are in the `style.css` this project does not import —
so both come from `canvasNodeHandleStyle` in the token map.

They are **inline styles, not classes**, and the reason is not the
usual specificity one: `base.css` sets a handle's background
through the single class `.react-flow__handle`, but Tailwind v4
emits its utilities inside `@layer utilities`, and an unlayered
declaration beats a layered one whatever the source order — so a
`bg-*` class would lose outright.

Handles are **faint at rest and fade to full strength** when the
node is hovered or selected, which is when a connection is about to
be drawn, so a canvas of components is not a field of dots. The
fade is **opacity only, and every handle stays mounted**: React
Flow measures a node's handles to place the ends of its edges, so a
handle removed from the tree or hidden with `display: none` loses
its measured box and the connections attached to it lose their
endpoints.

**Selection is shown on the outline, in two channels.** A component
at rest is stroked in its colour's `border` at the `rest` weight,
which keeps it subtle against the canvas; a selected one is stroked
in that colour's brighter `selectedBorder` at the heavier `selected`
weight, so it is clearly visible. Both the colour and the weight
change, because selection must not rely on colour alone. For a
`default` node those two are `--border` and `--ring`; for a coloured
one they are the tinted border and the hue itself, so the selected
treatment is the same in every theme.

It is drawn as part of the shape rather than as a CSS ring on the
node wrapper: a ring is a rectangle, so it would sit *around* a
hexagon or a circle instead of on it, while a stroke follows
whatever outline the shape draws and scales with the node like the
rest of its geometry. The box every shape is laid out in is inset
by half the **current** stroke, so the heavier selected outline is
not clipped by the viewBox either.

### Resizing a component

A selected component carries React Flow's `NodeResizer` — four
corner handles and four edges — and an unselected one carries no
controls at all, so the handles read as part of the selected
outline rather than as a second highlight competing with it.

They are deliberately quiet: an `8px` hollow square on the node's
own `--card` surface, outlined in the same `--ring` the selected
node is stroked with, with the edges in that colour mixed to 45%.
React Flow's own handle is 5px with a hardcoded white border, which
is both awkward to hit and the wrong palette, so size and colour
both come from `canvasNodeResizeControlStyles` in the token map.

Every shape scales with the resized box, because the geometry was
already computed from the width and height passed in. **A circle
stays circular**, through `keepAspectRatio`: its default size is
square, so locking the ratio at the start of a gesture locks it at
1:1. Every other shape resizes freely on both axes.

The floor is the shape's own minimum from the token map, never a
number in the renderer. Width and height stay React Flow's, which
means Liveblocks Storage's — there is no second copy of a node's
size, and no manual history handling, since the Liveblocks React
Flow integration already groups a resize gesture into one undo
step.

### Editing a component label

**Double-click a component to rename it in place.** A textarea
takes the label's position — the same centred box, the same
`text-sm font-medium`, the same shape inset — rather than being
layered over it, so opening the editor neither shifts the text nor
shows it twice. `field-sizing-content` with `min-h-0` is what keeps
it centred as the text wraps.

Nearly all of the `Textarea` primitive's own box styling is
overridden: its border, padding, background, minimum height, and
focus ring belong to a form field on a panel, and this one has to
look like a label on a shape. The focus ring goes for the same
reason the selected state is not a CSS ring — it is a rectangle
around a hexagon. The caret and the node's selected outline are
what show that editing is in progress.

An empty label shows the placeholder `Name this component`, in the
primitive's own `--muted-foreground`. The double-click is taken on
the whole label area rather than on the text, so a component with
no label can still be renamed.

The editor carries `nodrag` and `nopan`, so clicking into it or
dragging across the text moves neither the node nor the canvas, and
the label area carries `nopan` too — that is what stops the opening
double-click from also zooming the canvas in. React Flow's zoom is
a d3 listener below React's root, so a synthetic
`stopPropagation` would run too late; d3's filter rejects events
inside `nopan` instead.

Blur or `Escape` closes it. **`Escape` does not revert**: every
keystroke has already gone to the collaborative document and been
seen by the rest of the room, so there is no local draft to discard
and undo is what takes a rename back. One editing session is one
undo step, because Liveblocks history is paused while the editor is
open — including if it unmounts still open.

**Whether the editor is open is local to one browser.** It is
React state in the node renderer and reaches neither Storage — a
room's document is the diagram, not who is midway through renaming
part of it — nor Presence, nor Prisma. Focus is the browser's; no
state mirrors it. Only the resulting label is collaborative.

### Recolouring a component

A selected component carries a **floating colour toolbar** above it —
React Flow's `NodeToolbar`, at `Position.Top` with the
`canvasNodeToolbarOffset` gap, which clears both the outline and the
resize handles. It does not scale with the canvas, so the swatches
stay the same size at every zoom level.

It is the same floating surface as the component toolbar at the
bottom of the canvas — a bordered pill on `--card` with a shadow and
a backdrop blur — so the two read as the same kind of overlay rather
than as two different ones.

One swatch per predefined theme, drawn in that theme's own surface
and border, so what is being chosen is what will appear. **The
active swatch is marked in three ways**: a tick, the selected border
colour, and the heavier of the two node stroke weights, so it is
identifiable without relying on colour, and `aria-pressed` says the
same to a screen reader. A colour has no accessible name of its own,
so each swatch takes the theme's display name from the token map as
both its `aria-label` and its hover hint. Hover is a slight lift in
brightness — subtle on a dark surface, and it needs no second set of
hover colours.

The toolbar carries `nodrag`, `nopan`, and `nowheel`. `NodeToolbar`
portals into `.react-flow__renderer`, which is the element d3-zoom is
bound to, so without them a press on a swatch would pan the canvas, a
double click would zoom it, and a scroll over the pill would zoom
too.

Choosing a swatch writes **only** the node's `color` key, through the
same `updateNodeData` path the label takes — so it is one Liveblocks
mutation, visible to the whole room immediately, with no server call
and nothing in Prisma. One click is one undo step, so no history
handling is needed around it.

**Whether the toolbar is showing is local to one browser.** It is
React Flow's own selected state and nothing else: it reaches neither
Storage — a room's document is the diagram, not who has clicked on
part of it — nor Presence, nor Prisma. Only the resulting colour is
collaborative.

### Component drag preview

Dragging a component out of the toolbar shows a **ghost of the node
it will become**, attached to the cursor: the same
`CanvasNodeBody` the canvas renders, at the width, height, shape,
and label from the drag payload, in the default node colour. Drawing
it from the payload rather than from a second description of the
component is what keeps what is dragged and what lands identical.

It is slightly transparent (`opacity-70`) and never drawn as
selected — nothing exists yet to have been selected — and it carries
`pointer-events-none` so it is never itself the element under the
cursor. It is centred on the pointer, matching the drop, which
offsets the new node by half its size so the component lands where
the ghost was.

The ghost is portalled to `document.body` and positioned `fixed`.
Pointer coordinates address the viewport, which is what `fixed`
resolves against; inside React Flow's transformed viewport the pan
and zoom would be applied to it a second time, and a preview clipped
to the canvas region would vanish as the cursor crossed the panels.
Its z-index clears the two `z-40` side panels.

The browser's own drag image — a translucent snapshot of the toolbar
button — is replaced with a transparent 1×1 canvas, so the shape
preview is the only thing following the cursor rather than one of
two.

**The preview is local to the current client.** It is React state in
`hooks/use-canvas-drag-preview.ts` and nothing more: it is never
written to Liveblocks Storage, because nothing has been created yet,
and never to Presence, because what somebody is *about* to drop is
not shown to the room. The collaborative write still happens once,
on drop. The preview is removed on `dragend`, which fires on the drag
source after a drop **and** after a cancellation, so one handler
covers both.

The pointer is tracked from `dragover` on the document, not
`mousemove`: a native HTML5 drag suppresses mouse events, so the drag
events are the only ones carrying coordinates while one is in flight.
That listener does not call `preventDefault`, so observing the drag
does not turn the whole page into a drop target — where a component
may actually be dropped is still the canvas' own decision.

### Component toolbar

Components are added by dragging them from a floating pill at the
**bottom-centre of the canvas**. It is a React Flow `Panel`, so
React Flow's own `base.css` positions it over the viewport and it
belongs to the canvas region rather than to the page. It carries
`nopan` and `nowheel`, so a drag or a scroll that starts on the
toolbar does not pan or zoom the canvas beneath it.

The components are grouped as **WorkHQ**, **Design Studio**, and
**Shared**, each group behind a visible `text-xs` heading with a
one-pixel divider between groups — not before the first, so the
pill does not open with a rule against its rounded edge. The
heading is shown rather than only announced, because the icons are
of concepts a new user has no reason to recognise, so the group
name is what says which product a component belongs to.

Each component is a `button`, so it is in the tab order and reads
as a control, showing its Lucide icon beside its name. The
description is attached with `title` for a hover hint on an
unfamiliar icon; there is no `Tooltip` primitive installed yet, and
the native one carries this until there is.

A component button has **no click behaviour** — a component is
created by dragging it onto the canvas, and a click has no cursor
position to mean anything at — so it is left as a labelled drag
source rather than wired to a no-op.

The toolbar owns the drag-preview state, because `dragstart` and
`dragend` both fire on the drag source: one hook mounted here covers
both the appearance and the removal of the ghost, with no need for
the canvas to report a drop back. See **Component drag preview**
above.

At a narrow width the groups scroll sideways inside the pill rather
than wrapping, so the toolbar cannot grow into a block that covers
the canvas. The canvas is a desktop-first surface, so this is a
fallback rather than the intended layout.

### Canvas control bar

How the canvas is navigated, and how a change is taken back, is a
second floating pill at the **bottom-left**. Like the component
toolbar it is a React Flow `Panel` carrying `nopan` and `nowheel`,
and it is the same floating surface — a bordered pill on `--card`
with a shadow and a backdrop blur — so every overlay on the canvas
reads as the same kind of thing.

It holds five icon controls in two groups, separated by a subtle
inset rule: **zoom out, fit view, zoom in**, then **undo, redo**.
Fitting sits between the two zoom controls rather than beside them,
because it is the way back from either. The divider carries
`self-stretch` — the pill is `items-center`, where a `w-px` element
with no content has no height at all.

The controls are the shadcn `Button` primitive in its ghost icon
form with the radius rounded to a full circle, rather than bare
`button` elements as the component toolbar's drag sources are. That
is the standard order of preference, and it is also what dims a
disabled control: `disabled:opacity-50` comes with the primitive, so
an unavailable history action needs no second set of styles. **Undo
and redo are disabled from Liveblocks' own `useCanUndo` and
`useCanRedo`**, never from a count kept locally.

Each icon is decorative, so the accessible name is the control's
label, and the hover hint adds the keys that do the same thing. The
hint names **both** modifiers — `Ctrl/⌘` — rather than the one this
platform uses: detecting the platform would put a value in the
markup the server cannot know, and the shortcut accepts either key.

The bar is lifted clear of the component toolbar rather than
relying on a horizontal gap, because that pill is centred and grows
to nearly the full width of the canvas, so at a narrow window the
two would meet in this corner. The offset is an **inline `bottom`**,
not a utility class: `base.css` pins a bottom panel with
`bottom: 0` at the same specificity a class has, so which won would
depend on the order the two stylesheets end up in.

Its dimensions live in `features/canvas/canvas-control-tokens.ts`,
the third sibling of the node and edge token maps: the offset above,
the viewport animation duration, and the shared fit-view options.
Nothing in that file is a colour — the pill is expressed in Tailwind
classes against the palette, as the other overlays are.

**A viewport movement is animated over a short duration**, the same
one for a button and for a keyboard shortcut. A zoom that jumps
loses the reader's place on a large diagram, because nothing
connects what was in view to what is now. React Flow animates only
when a duration is given, so its own default is an instant jump.

**Fitting the view is capped at a zoom of 1**, shared with the
canvas' own first fit, so a canvas holding a single component does
not fill the viewport with it.

**The viewport is this client's own.** Zooming and fitting move
nobody else's view: neither is written to Liveblocks Storage or to
Presence, and no viewport state is persisted, so opening a project
always starts from the fit.

### Canvas keyboard shortcuts

`hooks/use-keyboard-shortcuts.ts` binds the same actions to keys:
`+` or `=` zooms in, `-` zooms out, `Cmd/Ctrl + Z` undoes,
`Cmd/Ctrl + Shift + Z` and `Cmd/Ctrl + Y` redo. The actions are
**passed into the hook** by the control bar, which is where all four
are already gathered, so a key and the button beside it run the same
call.

The listener is on `window` rather than on the canvas, because
React Flow's viewport is not focusable and a shortcut has to work
without the canvas having been clicked first.

That reach is why **a keypress inside a text field is left alone** —
an `input`, a `textarea`, a `select`, or anything inside a
`contenteditable`, tested with `closest` so being *inside* one
counts. Otherwise typing `-` into a node or connection label would
zoom the canvas out, and `Cmd + Z` in a field would undo somebody's
last component instead of the character just typed.

`preventDefault()` is called **only on a keypress the canvas
actually handles**, and a modified `=` or `-` is deliberately not
one of them: `Cmd/Ctrl + -` and `Cmd/Ctrl + =` stay the browser's
page zoom, which is an accessibility feature and not the canvas' to
take. `Shift` is allowed on the zoom keys, since that is how `+` is
typed on most layouts.

### Connections

A connection between two components is drawn by dragging from one of
a node's four handles to anywhere on another node. Connections are
**loose**: any handle can start one and any handle can receive it,
because to the person drawing the diagram a right-to-right drag is
the same connection as a left-to-right one. No side is a source or
a target, and nothing validates whether a connection makes
architectural sense.

There is **one connection appearance**, from
`features/canvas/canvas-edge-tokens.ts` — the sibling of the node
token map, holding every stroke, opacity, dimension, and marker a
connection is drawn with, so the renderer holds none of them. A
relationship *type* — invokes, uses, reads, writes — and a colour or
a dash per type are later units, so `red` is no more an error here
than a red node is.

Routing is **right-angled**, through `getSmoothStepPath`, with the
turns rounded by a small radius so the path still reads as
horizontal and vertical runs rather than as a curve. Straight
diagonal lines were not used: an architecture diagram is read by
following a line between two boxes, and orthogonal runs stay
legible where several of them cross.

The line is a thin `--muted-foreground` stroke with rounded ends —
light against the dark canvas without competing with a component's
`--foreground` label — ending in a closed arrowhead at the end the
user dragged to. One arrowhead, at the target only, is what makes
the direction unambiguous.

**Hover and selection are shown in two channels**, like a node's
selection: a connection at rest is dimmed and thin, and an active
one comes to full opacity and a slightly heavier weight, so it does
not read as active by brightness alone. The dimming is `opacity`
rather than `stroke-opacity`, which is load-bearing — a marker is
painted as part of the path, so `opacity` carries the arrowhead with
the line while `stroke-opacity` would leave the arrow at full
strength.

**A thin line is still easy to hit.** React Flow draws a wide, fully
transparent path along the same geometry, so the clickable band is
far wider than the visible stroke without the stroke itself
thickening. The visible weight and the hit area are two separate
values in the token map for that reason.

The look and the arrowhead are React Flow's **edge defaults** rather
than values written onto each connection as it is made. They are
merged into a connection before it is stored, so a new edge needs no
special creation path, and merged again at render, so a connection
stored before this existed is drawn the same as one made today.

### Connection labels

A connection can carry a label — "submits", "reads from" — shown as
a **small pill on the middle of the line**: the same floating
surface as the canvas overlays, a bordered `--card` pill with a
shadow and a blur, so a label sitting on a line reads as the same
kind of thing as the toolbars. It sits at the midpoint the router
itself reports, so it stays on the path through every corner an
orthogonal route takes.

An unlabelled connection shows **nothing at all until it is
selected**, and then a faint dashed hint inviting a label — a canvas
of unlabelled connections should not be a canvas of hints.

**Double-click a connection, or its label, to edit it in place.** The
input takes the pill's own shape and grows with what is typed
(`field-sizing-content` over a minimum width), so opening the editor
does not change the size or position of what was there. Most of the
`Input` primitive's box styling is overridden for that: its fixed
height, full width, radius, padding, and dark background belong to a
form field on a panel.

Both the line and the label carry `nopan`, and the label also
`nodrag`, so neither the opening double-click nor a drag across the
text pans or zooms the canvas. React Flow's zoom is a d3 listener
below React's root, so a synthetic `stopPropagation` would run too
late; d3's filter rejects events inside those classes instead.
Anything interactive inside the label layer also needs
`pointer-events-auto`, because the layer disables pointer events on
itself so the edges beneath it stay clickable.

Blur, `Enter`, or `Escape` closes the editor. **`Escape` does not
revert**, for the same reason a node label's does not: every
keystroke has already gone to the collaborative document, so there
is no local draft to discard and undo is what takes a label back.
One editing session is one undo step, because Liveblocks history is
paused while the editor is open — including if it unmounts still
open.

**Whether the editor is open is local to one browser**, as is
whether a connection is hovered. Both are React state in the edge
renderer and reach neither Storage — a room's document is the
diagram, not who is midway through labelling part of it — nor
Presence, nor Prisma. Only the resulting label is collaborative.

### Starter templates

A canvas can be started from a predefined high-level IA
architecture. The picker is an `EditorDialog` widened to
`sm:max-w-3xl` — the default `sm:max-w-md` would leave the
diagrams too narrow to read — holding one `Card` per template
in a `sm:grid-cols-2` grid inside a `max-h-[60vh]`
`ScrollArea`, so **the grid scrolls and the dialog's footer
does not move**. Each card carries the template's name, a
one-line description, a diagram preview, and a full-width
import button in the card footer.

The preview is a **fixed-size panel**: a `h-32` `rounded-lg`
bordered box on `--background` rather than the card surface,
so it reads as a window onto a canvas. Every template is
scaled into the same box — bounds computed from the template's
own node positions, centred, and never enlarged past 1:1, so a
four-component template is not blown up to look bigger than a
six-component one.

Inside it, a template is drawn as **one small `<svg>` and
nothing else**: no React Flow instance, no Liveblocks, no
labels, and no arrowheads. The shapes come from the canvas's
own shape geometry and the node colour map, so the preview
cannot drift from what the import produces; connections are
straight lines between node centres in the shared edge stroke
and resting opacity, drawn beneath the shapes as they are on
the canvas. Text and orthogonal routing are dropped
deliberately — neither survives the scale, and the card's name
and description carry the meaning. The `<svg>` is therefore
`aria-hidden`, and the import button's accessible name names
its template so three of them are distinguishable.

Choosing a template **replaces the whole canvas** and closes
the dialog, with no confirmation step: the replacement is one
undo step, so `Undo` is the way back rather than a second
dialog. The dialog says so in its description. The canvas then
animates to fit the imported architecture, using the shared
fit-view options, so an import comes to rest where the
control bar's fit button and the canvas's first fit do.

A template's colours are a **visual grouping only**, like
every other node colour: WorkHQ components arrive blue and
Design Studio components green so a hybrid architecture is
legible at a glance, and nothing reads a colour to decide
anything.

There is no template creating, saving, editing, category, or
search. These are read-only predefined architectures.

### Workspace navbar

The navbar has three equal sections. The left one carries the
project sidebar toggle; the centre shows the open project's
**name** as a truncating `text-sm font-semibold` heading; the
right holds the project actions and then Clerk's user menu.

The project name and the project actions — the starter
templates entry point, share, and the AI sidebar toggle —
appear **only when a project is open**, so the editor home
shows the sidebar toggle and the user menu alone. The name
comes from the project lists the editor layout already
fetched, matched on the route's ID, so there is no second
query for it and the chrome shows no name for a project the
server refused.

The three are ordered and weighted by what they act on.
`Templates` comes first as a **ghost** button, because it acts
on the canvas; `Share` follows as the one **outline** button,
because it acts on the project; the AI toggle is a ghost icon.
`Templates` shows its label beside the icon rather than being
icon-only like the AI toggle — opening a picker that can
replace the whole architecture should not depend on
recognising a glyph — and the label is `sr-only` on the
narrowest screens rather than removed, so the accessible name
survives.

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
