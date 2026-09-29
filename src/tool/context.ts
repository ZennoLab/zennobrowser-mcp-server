import { z } from 'zod';
import type { Operation, Parameter } from '../openapi/types';
import { schemaToZod } from './schema';

/** HTTP methods supported by the MCP tool layer. */
export type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';

interface ToolAnnotations {
  readOnlyHint: boolean;
  idempotentHint: boolean;
  destructiveHint: boolean;
  openWorldHint: boolean;
}

const METHOD_ANNOTATIONS: Record<HttpMethod, ToolAnnotations> = {
  get: { readOnlyHint: true,  idempotentHint: true,  destructiveHint: false, openWorldHint: false },
  post: { readOnlyHint: false, idempotentHint: false, destructiveHint: false, openWorldHint: false },
  put: { readOnlyHint: false, idempotentHint: true,  destructiveHint: true,  openWorldHint: false },
  delete: { readOnlyHint: false, idempotentHint: true,  destructiveHint: true,  openWorldHint: false },
  patch: { readOnlyHint: false, idempotentHint: false, destructiveHint: true,  openWorldHint: false },
};

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

/** Input key used to carry the JSON request body through the flattened tool input. */
export const BODY_KEY = 'body';

/**
 * Wraps an OpenAPI operation as an MCP tool definition, exposing the tool name,
 * metadata, Zod input schema, and MCP annotations derived from the HTTP method.
 */
export class ToolContext {
  /**
   * @param method - HTTP method of the operation.
   * @param pathTemplate - OpenAPI path template, e.g. `/workspaces/{id}`.
   * @param operation - The OpenAPI operation object for this method + path.
   */
  constructor(
    public readonly method: HttpMethod,
    public readonly pathTemplate: string,
    private readonly operation: Operation,
  ) {}

  /** Tool name derived from `operationId`, or `{method}_{path}` if absent. */
  get toolBaseName(): string {
    return this.operation.operationId
      ? slugify(this.operation.operationId)
      : `${this.method}_${slugify(this.pathTemplate)}`;
  }

  /** Human-readable tool title from the operation summary. */
  get title(): string {
    return this.operation.summary ?? this.toolBaseName;
  }

  /** Full tool description from the operation description or summary. */
  get description(): string {
    return this.operation.description ?? this.operation.summary ?? '';
  }

  /** MCP tool annotations derived from the HTTP method semantics. */
  get annotations(): ToolAnnotations {
    return METHOD_ANNOTATIONS[this.method];
  }

  /** Path and query parameters declared on this operation. */
  get parameters(): Parameter[] {
    return this.operation.parameters ?? [];
  }

  /**
   * Zod shape for the tool's input, combining all path/query parameters
   * and the JSON request body (keyed as `BODY_KEY`).
   */
  get inputSchema(): Record<string, z.ZodTypeAny> {
    const shape: Record<string, z.ZodTypeAny> = {};

    for (const param of this.parameters) {
      const description = param.description ?? param.schema?.description;
      let field = schemaToZod(param.schema ?? {});
      if (description) { field = field.describe(description); }
      shape[param.name] = param.required ? field : field.optional();
    }

    const bodySchema = this.operation.requestBody?.content?.['application/json']?.schema;
    if (bodySchema) {
      let bodyField = schemaToZod(bodySchema);
      if (this.operation.requestBody?.description) {
        bodyField = bodyField.describe(this.operation.requestBody.description);
      }
      shape[BODY_KEY] = bodyField;
    }

    return shape;
  }
}
