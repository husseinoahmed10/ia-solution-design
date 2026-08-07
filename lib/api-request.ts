/**
 * Reads a JSON request body without letting a malformed payload throw inside a
 * route handler.
 *
 * An entirely absent body resolves to `{}` rather than a failure: a request
 * whose fields are all optional is legitimately empty, and the schema decides
 * what a missing field means. Only content that is present and not valid JSON
 * is a failure.
 */
export type JsonBodyResult = { ok: true; body: unknown } | { ok: false };

export async function readJsonBody(request: Request): Promise<JsonBodyResult> {
  const raw = await request.text();

  if (raw.trim().length === 0) {
    return { ok: true, body: {} };
  }

  try {
    return { ok: true, body: JSON.parse(raw) };
  } catch {
    return { ok: false };
  }
}
