/**
 * JSON response helpers, so every route handler answers with the same body
 * shape and the same status codes. Handlers stay thin: validate, authorise,
 * call a service, and return one of these.
 */
export interface ApiErrorBody {
  error: string;
}

function errorResponse(error: string, status: number): Response {
  return Response.json({ error } satisfies ApiErrorBody, { status });
}

/** The request body was missing, unparseable, or failed validation. */
export function badRequestResponse(error: string): Response {
  return errorResponse(error, 400);
}

/** No signed-in Clerk user. */
export function unauthorizedResponse(): Response {
  return errorResponse("Authentication required.", 401);
}

/** A signed-in user who may not take this action on this record. */
export function forbiddenResponse(): Response {
  return errorResponse("You are not allowed to perform this action.", 403);
}

/** The record does not exist. */
export function notFoundResponse(): Response {
  return errorResponse("Not found.", 404);
}
