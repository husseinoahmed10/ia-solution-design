/**
 * Derives a project slug from a project name: lower case, with every run of
 * non-alphanumeric characters collapsed to a single hyphen and no hyphen at
 * either end.
 *
 * The Create Project dialog previews the result on every keystroke, so this
 * stays pure and cheap. Trimming both ends keeps the preview stable while the
 * user types a separator — a trailing space adds nothing until a word follows.
 */
export function toProjectSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
