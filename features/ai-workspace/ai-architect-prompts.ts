/**
 * The suggestions offered in the AI Architect's empty state.
 *
 * They are **UI suggestions only**: nothing reads this list to send a prompt,
 * because no AI provider is wired up yet. It lives here rather than inside the
 * empty state so that the wording is in one place when the chips do become
 * actions.
 */
export const AI_ARCHITECT_STARTER_PROMPTS = [
  "Design a WorkHQ workflow",
  "Design a Design Studio process",
  "Review this solution architecture",
] as const;
