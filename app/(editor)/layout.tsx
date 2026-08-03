import { EditorShell } from "@/components/editor/editor-shell";

/**
 * Wraps every editor route in the shared chrome. The shell is a Client
 * Component because it owns the sidebar open state, but `children` stays a
 * Server Component tree — it is passed through as rendered output.
 */
export default function EditorLayout({ children }: LayoutProps<"/">) {
  return <EditorShell>{children}</EditorShell>;
}
