# Contributing

## Reporting bugs and requesting features

Use GitHub Issues with the provided templates.

## Development setup

```bash
git clone https://github.com/zennolab/zennolab-mcp-server.git
cd zennolab-mcp-server
npm install
npm run build
```

Type-check without building:

```bash
npx tsc --noEmit
```

Run the server locally (requires ZennoBrowser running):

```bash
ZB_API_TOKEN=your-token npm run start
```

## Testing a local build in an MCP client

When you need to test your changes end-to-end inside Claude Desktop, Cursor, or VS Code without publishing to npm, use `npm pack` to produce a local tarball and point your MCP client at it.

**1. Build and pack:**

```bash
npm run build
npm pack
# produces zennolab-mcp-server-<version>.tgz in the current directory
```

**2. Install the tarball globally:**

```bash
npm install -g zennolab-mcp-server-<version>.tgz
```

**3. Point your MCP client at the global binary** (same config as the global install):

```json
{
  "mcpServers": {
    "zennobrowser": {
      "command": "zennolab-mcp-server",
      "env": {
        "ZB_API_TOKEN": "your-token-here"
      }
    }
  }
}
```

Restart the MCP client after each reinstall to pick up changes.

**Alternatively**, skip the global install and use the tarball directly with `npx`:

```json
{
  "mcpServers": {
    "zennobrowser": {
      "command": "npx",
      "args": ["-y", "/absolute/path/to/zennolab-mcp-server-<version>.tgz"],
      "env": {
        "ZB_API_TOKEN": "your-token-here"
      }
    }
  }
}
```

> The `.tgz` file is listed in `.gitignore` — do not commit it.

**Fastest iteration: point the MCP client directly at `npm run start`**

No pack or install step needed — just build and the client picks up changes on next restart:

```json
{
  "mcpServers": {
    "zennobrowser": {
      "command": "npm",
      "args": ["run", "start"],
      "cwd": "/absolute/path/to/zennolab-mcp-server",
      "env": {
        "ZB_API_TOKEN": "your-token-here"
      }
    }
  }
}
```

Rebuild and restart the MCP client to apply changes:

```bash
npm run build
# then restart Claude Desktop / Cursor / VS Code
```

## Submitting changes

1. Fork the repository and create a branch from `main`.
2. Make your changes and verify the build passes (`npm run build`).
3. Open a pull request against `main` with a clear description of the change.

## Keeping up with ZennoBrowser API changes

When ZennoBrowser releases an API update that affects the OpenAPI specs served at `/openapi/*.v1.json`, the MCP server may need a patch or update.

**Owner:** ZennoBrowser backend team

**Trigger:** A ZennoBrowser release that changes any Public API endpoint, adds new operations, or deprecates existing ones.

**Process:**
1. Review the updated OpenAPI spec diff.
2. If the change is additive (new operations), no code change is needed — the server picks them up automatically at runtime.
3. If an operation is removed or renamed, update the corresponding `patches/*.v1.json` override or remove the outdated patch entry.
4. If a schema change breaks existing tool inputs, update the relevant patch file and bump the package version.
