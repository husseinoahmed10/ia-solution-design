/**
 * Clerk appearance for the whole application.
 *
 * Clerk's `dark` theme is the base, and every override points at a CSS variable
 * from `app/globals.css` rather than a literal colour, so the Clerk components
 * follow the palette in `ui-context.md` and change with it.
 */
import { dark } from "@clerk/ui/themes";

export const clerkAppearance = {
  theme: dark,
  variables: {
    // Surfaces and text.
    colorBackground: "var(--card)",
    colorForeground: "var(--card-foreground)",
    colorMuted: "var(--muted)",
    colorMutedForeground: "var(--muted-foreground)",
    // Light shades act as the neutral in a dark theme (borders, hover fills).
    colorNeutral: "var(--foreground)",
    colorBorder: "var(--border)",
    colorShadow: "var(--background)",
    colorModalBackdrop: "color-mix(in srgb, var(--background), transparent 25%)",

    // Actions and status.
    colorPrimary: "var(--primary)",
    colorPrimaryForeground: "var(--primary-foreground)",
    colorDanger: "var(--destructive)",
    colorSuccess: "var(--success)",
    colorWarning: "var(--warning)",

    // Form fields.
    colorInput: "var(--secondary)",
    colorInputForeground: "var(--secondary-foreground)",
    colorRing: "var(--ring)",

    // Typography and shape, matching the tokens the rest of the app uses.
    fontFamily: "var(--font-geist-sans)",
    fontFamilyMono: "var(--font-geist-mono)",
    // Clerk's own base is 0.8125rem (13px), which reads noticeably smaller than
    // the interface around it. 0.875rem is the `text-sm` the application uses
    // for body copy; Clerk derives its xs–xl steps from this one value.
    fontSize: "0.875rem",
    borderRadius: "var(--radius)",
  },
};
