/** MCP tool response with no content. */
export const emptyResponse = { content: [] as never[] };

/**
 * Builds an MCP tool response from a successful API result. Objects are also
 * attached as `structuredContent` for typed access by the MCP client.
 *
 * @param data - The parsed response value from the API.
 */
export function structuredResponse<T>(data: T) {
  const text = typeof data === 'string' ? data : JSON.stringify(data);
  const base = { content: [{ type: 'text' as const, text }] };
  if (data !== null && typeof data === 'object' && !Array.isArray(data)) {
    return { ...base, structuredContent: data };
  }
  return base;
}

/**
 * Builds an MCP tool error response from a caught error or HTTP failure.
 *
 * @param error - The thrown value; may be an `Error` instance or any other type.
 */
export function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return { content: [{ type: 'text' as const, text: `Error: ${message}` }], isError: true as const };
}
