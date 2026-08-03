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

Use normal sentence case. Avoid excessive uppercase labels.

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

`Button`, `Card`, `Dialog`, `Input`, `Tabs`, `Textarea`,
and `ScrollArea`. Add further primitives with the CLI when
a feature needs them rather than writing custom versions.

These primitives use the Radix composition API, so compose
a trigger with `asChild` rather than a `render` prop:

```tsx
<DialogTrigger asChild>
  <Button variant="outline">Open</Button>
</DialogTrigger>
```

Merge incoming class names with the `cn()` helper from
`lib/utils.ts` so callers can override styles predictably.

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

## Interaction Rules

- Always show loading, empty, success, and error states.
- Use confirmation dialogs for destructive actions.
- Do not rely on colour alone to communicate status.
- Keep the primary action for the current stage visually clear.
- Use tooltips for unfamiliar WorkHQ and Blue Prism component icons.
