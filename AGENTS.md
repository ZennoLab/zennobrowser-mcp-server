# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, OpenAI Codex, etc.) when working with code in this repository.

## Commands

```bash
npm install        # Install dependencies
npm run build      # Compile TypeScript (src/ → dist/)
npm run start      # Run the MCP server
npx tsc --noEmit   # Type-check only (no test framework or linter configured)
```

Requires **Node ≥ 20**. The package also exposes a `bin` entry (`zennobrowser-mcp-server`) usable via `npx` after publishing.

## MCP Client Configuration

Add to Claude Desktop (`claude_desktop_config.json`) or Cursor MCP settings:

```json
{
  "mcpServers": {
    "zennobrowser": {
      "command": "node",
      "args": ["/absolute/path/to/dist/index.js"],
      "env": {
        "ZB_API_TOKEN": "your-token-here",
        "ZB_API_BASE_URL": "http://localhost:8160"
      }
    }
  }
}
```

## Environment

| Variable | Required | Default |
|---|---|---|
| `ZB_API_TOKEN` | Yes | — |
| `ZB_API_BASE_URL` | No | `http://localhost:8160` |

## Architecture

This is a **dynamic MCP server**: all tools are generated at runtime from ZennoBrowser's OpenAPI specs — there are no hardcoded tool definitions. The pipeline is:

```
src/index.ts → src/openapi/ → src/tool/ → src/tool-registrar.ts → src/api-client.ts
```

1. **`src/index.ts`** — Entry point. Fetches 7 OpenAPI specs from `ZB_API_BASE_URL/openapi/*.v1.json`, registers tools, connects stdio transport.

2. **`src/openapi/loader.ts`** — Fetches specs. **`resolver.ts`** resolves `$ref` references recursively. **`patcher.ts`** deep-merges local override files from `patches/` (matched by filename).

3. **`src/tool/context.ts`** — Wraps each OpenAPI operation: computes tool name from `operationId`, builds a merged parameter list (path-level + operation-level), converts JSON Schema to Zod (`src/tool/schema.ts`), and derives MCP annotations from HTTP method (GET → readOnly/idempotent, PUT/DELETE → destructive/idempotent, PATCH → destructive).

4. **`src/tool-registrar.ts`** — Iterates all paths/methods, instantiates `OperationContext`, registers each operation as an MCP tool. Duplicate `operationId` slugs silently overwrite the earlier tool — no deduplication is performed.

5. **`src/api-client.ts`** — Executes API calls: interpolates path parameters into the URL template, builds query string (array params repeated), serializes remaining input keys as the JSON body, sends `Api-Token` header.

6. **`src/tool/responses.ts`** — Formats MCP tool responses (`structuredResponse`, `errorResponse`, `emptyResponse`).

## Patch System

To override or extend an OpenAPI spec without modifying upstream data, add a JSON file to `patches/` named after the spec (e.g. `patches/profiles.v1.json`). The file is deep-merged on top of the fetched spec before any processing.

## Key Constraints

- OpenAPI specs are fetched from the live API at startup; the server exits if any spec fails to load.
- Tool names are derived from `operationId`; if absent, they fall back to `{method}_{sanitized_path}`.
- `src/tool/schema.ts` supports: `integer`, `number`, `boolean`, `string`, `array`, `object`, `enum`, nullable types, required fields, descriptions, and defaults. Unsupported schema types fall back to `z.unknown()`.

## Gotchas

- **Patch files can only modify existing paths/schemas** — new paths cannot be added via patches; unmatched keys are silently skipped (`src/openapi/patcher.ts`).
- **Invalid JSON in a patch file is silently ignored** — no warning is logged; the spec runs without the patch (`src/openapi/loader.ts`).
- **Patch parameters are full replacements** — patching a parameter by name replaces it entirely; partial updates require re-specifying all fields (`src/openapi/patcher.ts`).
- **`oneOf` / `anyOf` / `allOf` are not supported** — these schema types fall back to `z.unknown()` with no warning (`src/tool/schema.ts`).
- **Header and cookie parameters are silently ignored** — only `in: path` and `in: query` parameters are sent; `in: header` / `in: cookie` are dropped (`src/api-client.ts`).
- **Request body must be nested under a `"body"` key** — the HTTP client reads `input["body"]` as the JSON body; top-level keys are treated as path/query params (`src/api-client.ts`).
- **MCP annotations are HTTP-method-based, not semantic** — all GETs are `readOnly/idempotent`, all DELETEs are `destructive/idempotent` regardless of actual operation behavior (`src/tool/context.ts`).
