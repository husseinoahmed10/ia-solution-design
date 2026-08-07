interface ProjectDialogErrorProps {
  error: string | null;
}

/**
 * The message from a failed project mutation, shown inside the dialog that
 * caused it so the user is told where the failure happened and the form they
 * would retry from stays open.
 *
 * It is a live region, because the text appears after the dialog has already
 * been announced and would otherwise be silent to a screen reader.
 */
export function ProjectDialogError({ error }: ProjectDialogErrorProps) {
  if (!error) {
    return null;
  }

  return (
    <p role="alert" aria-live="polite" className="text-sm text-destructive">
      {error}
    </p>
  );
}
