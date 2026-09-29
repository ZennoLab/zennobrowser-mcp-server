import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { OpenAPISpec } from './openapi';
import { ToolContext, type HttpMethod, emptyResponse, structuredResponse, errorResponse } from './tool';
import { ApiClient } from './api-client';

const HTTP_METHODS: HttpMethod[] = ['get', 'post', 'put', 'delete', 'patch'];

/**
 * Iterates all paths and methods across the provided OpenAPI specs and registers
 * each operation as an MCP tool on the server.
 *
 * @param server - The MCP server instance to register tools on.
 * @param specs - Resolved OpenAPI specs returned by `loadSpecs`.
 * @param options - API base URL and authentication token.
 */
export function registerToolsFromSpecs(
  server: McpServer,
  specs: OpenAPISpec[],
  options: { baseUrl: string; token: string },
): void {
  const client = new ApiClient(options.baseUrl, options.token);

  for (const spec of specs) {
    for (const [pathTemplate, pathItem] of Object.entries(spec.paths)) {
      for (const method of HTTP_METHODS) {
        const operation = pathItem[method];
        if (!operation) {
          continue;
        }

        const toolContext = new ToolContext(method, pathTemplate, operation);

        server.registerTool(
          toolContext.toolBaseName,
          {
            title: toolContext.title,
            description: toolContext.description,
            annotations: toolContext.annotations,
            inputSchema: toolContext.inputSchema,
          },
          async (input) => {
            try {
              const response = await client.execute(toolContext, input);
              if (!response.ok) {
                const text = await response.text();
                return errorResponse(new Error(`HTTP ${response.status} ${response.statusText}: ${text}`));
              }

              const text = await response.text();
              if (!text) {
                return emptyResponse;
              }

              const contentType = (response.headers.get('content-type') ?? '').split(';')[0].trim();
              let data: unknown;
              switch (contentType) {
                case 'application/json':
                case 'text/json':
                  data = JSON.parse(text);
                  break;
                case 'text/plain':
                  data = text;
                  break;
                default:
                  try { data = JSON.parse(text); } catch { data = text; }
              }

              return structuredResponse(data);
            } catch (error) {
              return errorResponse(error);
            }
          },
        );
      }
    }
  }
}
