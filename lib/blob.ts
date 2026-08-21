import { put } from "@vercel/blob";

/**
 * Vercel Blob, the application's file store.
 *
 * Blob is reached only through this adapter, per `architecture.md`, so the
 * provider can be replaced without touching the routes or the services. It is
 * **server-only**: the read/write token is read here and never reaches the
 * browser, and nothing uploads from the client.
 */

/**
 * `BLOB_READ_WRITE_TOKEN` is absent, so no Blob call can be made.
 *
 * A distinct type rather than a bare `Error`, for the same reason
 * `LiveblocksNotConfiguredError` is one: a caller can tell a *deployment* fault —
 * nothing the request did wrong, and nothing a retry fixes — apart from a Blob API
 * failure, and answer with a configuration error instead of masking it as a
 * refusal.
 */
export class BlobNotConfiguredError extends Error {
  constructor() {
    super(
      "BLOB_READ_WRITE_TOKEN is not set, so files cannot be written to Vercel Blob."
    );

    this.name = "BlobNotConfiguredError";
  }
}

/**
 * Whether a blob written by this application is reachable without credentials.
 *
 * **`private`, and deliberately.** A pathname built from a project ID is
 * deterministic — which is what lets the latest snapshot overwrite the previous
 * one at a stable URL — so a `public` blob would be readable by anybody who knew
 * a project ID, and project data is access-controlled on every other boundary
 * (invariant 6). A private blob is read back through the SDK on the server, which
 * is where the token already is.
 *
 * It is a named constant rather than a literal at the call site because it is the
 * one value here that a deployment could need to change.
 */
const BLOB_ACCESS = "private" as const;

/**
 * Writes a JSON document to Blob and returns its URL.
 *
 * The value is serialised here rather than by the caller, so the body and the
 * `content-type` cannot disagree.
 *
 * `addRandomSuffix: false` with `allowOverwrite: true` is what makes a caller's
 * pathname the whole address: writing the same pathname again replaces what was
 * there, rather than accumulating a new blob per write that nothing would ever
 * delete.
 *
 * The token is read at call time rather than at import, so loading this module
 * never throws: `next build` loads the route handlers without any runtime
 * environment, and a missing credential must fail the request that needs it rather
 * than the build. It is not passed to `put` — the SDK reads
 * `BLOB_READ_WRITE_TOKEN` itself, which is the configuration it expects — so this
 * check exists to produce a clear error rather than to supply the value.
 */
export async function uploadJsonBlob(
  pathname: string,
  json: unknown
): Promise<string> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new BlobNotConfiguredError();
  }

  const { url } = await put(pathname, JSON.stringify(json), {
    access: BLOB_ACCESS,
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  return url;
}
