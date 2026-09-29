#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { loadSpecs, type OpenAPISpec } from './openapi';
import { registerToolsFromSpecs } from './tool-registrar';

async function main() {
  const token = process.env.ZB_API_TOKEN;
  if (!token) {
    console.error('Error: Missing required environment variable ZB_API_TOKEN');
    process.exit(1);
  }

  const baseUrl = (process.env.ZB_API_BASE_URL ?? 'http://localhost:8160').replace(/\/$/, '');

  const specPaths = [
    '/openapi/workspaces.v1.json',
    '/openapi/proxies.v1.json',
    '/openapi/profiles.v1.json',
    '/openapi/presets.v1.json',
    '/openapi/threads.v1.json',
    '/openapi/browser_instances.v1.json',
    '/openapi/product.v1.json',
  ];

  let specs: OpenAPISpec[];
  try {
    specs = await loadSpecs(specPaths.map(p => baseUrl + p));
  } catch (err) {
    console.error('Error: Failed to load OpenAPI specs:', (err as Error).message);
    process.exit(1);
  }

  const server = new McpServer({
    name: 'zennobrowser-public-api',
    version: '1.1.0',
    description: 'MCP server exposing ZennoBrowser Public API functionalities.',
  });

  registerToolsFromSpecs(server, specs, { baseUrl, token });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error('Error: ', err);
  process.exit(1);
});
