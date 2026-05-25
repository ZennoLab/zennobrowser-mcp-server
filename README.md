# ZennoBrowser MCP Server

[![npm version](https://img.shields.io/npm/v/zennobrowser-mcp-server)](https://www.npmjs.com/package/zennobrowser-mcp-server)
[![license](https://img.shields.io/npm/l/zennobrowser-mcp-server)](LICENSE)
[![CI](https://github.com/ZennoLab/zennobrowser-mcp-server/actions/workflows/ci.yml/badge.svg)](https://github.com/ZennoLab/zennobrowser-mcp-server/actions/workflows/ci.yml)

MCP (Model Context Protocol) server for [ZennoBrowser](https://zennolab.com/en/products/zennobrowser/) Public API. Exposes browser automation and profile management capabilities to AI agents such as Claude Desktop, Cursor, and VS Code MCP clients.

## Requirements

- Node.js 20+
- ZennoBrowser running locally
- A valid ZennoBrowser API token

## Installation

### npx (no install required)

**Claude Desktop** — edit `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "zennobrowser": {
      "command": "npx",
      "args": ["-y", "zennobrowser-mcp-server@latest"],
      "env": {
        "ZB_API_TOKEN": "your-api-token-here"
      }
    }
  }
}
```

**Cursor** — add to MCP settings (`.cursor/mcp.json` or Settings → MCP):

```json
{
  "mcpServers": {
    "zennobrowser": {
      "command": "npx",
      "args": ["-y", "zennobrowser-mcp-server@latest"],
      "env": {
        "ZB_API_TOKEN": "your-api-token-here"
      }
    }
  }
}
```

**VS Code** (with GitHub Copilot MCP support) — add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "zennobrowser": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "zennobrowser-mcp-server@latest"],
      "env": {
        "ZB_API_TOKEN": "your-api-token-here"
      }
    }
  }
}
```

### Global install

```bash
npm install -g zennobrowser-mcp-server@latest
```

Then use `zennobrowser-mcp-server` as the command instead of `npx ... zennobrowser-mcp-server`:

```json
{
  "mcpServers": {
    "zennobrowser": {
      "command": "zennobrowser-mcp-server",
      "env": {
        "ZB_API_TOKEN": "your-api-token-here"
      }
    }
  }
}
```

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `ZB_API_TOKEN` | Yes | — | Authentication token for the ZennoBrowser Public API |
| `ZB_API_BASE_URL` | No | `http://localhost:8160` | Base URL of the ZennoBrowser Public API |

## Tools

### Workspaces
| Tool | Description |
|---|---|
| `get_workspaces` | List accessible workspaces |

### Profiles
| Tool | Description |
|---|---|
| `get_profiles` | List profiles with filtering and sorting |
| `get_profile` | Get a single profile with full fingerprint details |
| `create_profile` | Create a new profile |
| `bulk_create_profile` | Create multiple profiles at once |
| `update_profile` | Update profile settings |
| `delete_profile` | Delete a profile |
| `bulk_delete_profile` | Delete multiple profiles |
| `move_profile` | Move profiles to a folder |
| `recover_profile` | Recover a profile from an invalid state |
| `force_unlock_profile` | Force-unlock a cloud-locked profile |
| `import_cookies` | Import cookies (JSON or Netscape format) |
| `export_cookies` | Export cookies as JSON |
| `copy_cookies` | Copy cookies from one profile to another |
| `bulk_update_profile_preset` | Assign a preset to multiple profiles |
| `bulk_update_profile_proxy` | Update the proxy for multiple profiles |
| `bulk_update_profile_tags` | Update tags for multiple profiles |
| `cleanup_profile` | Clear profile cache |

### Profile Folders
| Tool | Description |
|---|---|
| `get_profile_folders` | List profile folders |
| `create_profile_folder` | Create a profile folder |
| `update_profile_folder` | Rename a profile folder |
| `delete_profile_folder` | Delete a profile folder |

### Proxies
| Tool | Description |
|---|---|
| `get_proxies` | List proxies |
| `create_proxy` | Create a proxy |
| `bulk_create_proxy` | Create multiple proxies |
| `update_proxy` | Update a proxy |
| `delete_proxy` | Delete a proxy |
| `bulk_delete_proxy` | Delete multiple proxies |
| `change_mobile_proxy_ip` | Trigger IP rotation for a mobile proxy |

### Proxy Folders
| Tool | Description |
|---|---|
| `get_proxy_folders` | List proxy folders |
| `create_proxy_folder` | Create a proxy folder |
| `update_proxy_folder` | Rename a proxy folder |
| `delete_proxy_folder` | Delete a proxy folder |

### Threads
| Tool | Description |
|---|---|
| `get_threads` | List threads |
| `create_thread` | Create a thread |
| `bulk_create_thread` | Create multiple threads |
| `continue_use_thread` | Extend thread lifetime |
| `bulk_continue_use_thread` | Extend lifetime of multiple threads |
| `stop_thread` | Stop a thread |
| `bulk_stop_thread` | Stop multiple threads |

### Browser Instances
| Tool | Description |
|---|---|
| `get_browser_instances` | List active browser instances |
| `start_browser_instance` | Launch a browser instance for a profile |
| `bulk_start_browser_instance` | Launch browser instances for multiple profiles |
| `stop_browser_instance` | Stop a browser instance |
| `bulk_stop_browser_instance` | Stop multiple browser instances |
| `set_browser_instance_visibility` | Show or hide a browser window |

### Presets & Extensions
| Tool | Description |
|---|---|
| `get_presets` | List presets |
| `create_preset` | Create a preset |
| `delete_preset` | Delete a preset |
| `get_extensions` | List extensions |
| `create_extension_from_web` | Add an extension from the Chrome Web Store |
| `create_extension_from_file` | Add an extension from a local .crx or .zip file |
| `delete_extension` | Remove an extension |

### Product
| Tool | Description |
|---|---|
| `get_product_version` | Get ZennoBrowser version |
| `get_browser_version` | Get browser engine version |
| `get_limits` | Get workspace resource limits |
| `get_tariff` | Get current tariff information |

## Example Prompts

**Create a profile and start the browser:**
> Create a new profile named "Test Profile", then start a browser instance for it.

**Full end-to-end flow:**
> Create a profile named "Scraper", create a proxy with URI "socks5://user:pass@1.2.3.4:1080", assign the proxy to the profile, create a thread, then start a browser instance for the profile using that thread.

**Bulk operations:**
> List all profiles in my default workspace and delete any that haven't been used in the last 30 days.

**Cookie management:**
> Export cookies from profile "Session A" and import them into profile "Session B".

## Troubleshooting

**`Error: Missing required environment variable ZB_API_TOKEN`**
Set the `ZB_API_TOKEN` environment variable to your ZennoBrowser API token.

**`Error: connect ECONNREFUSED 127.0.0.1:8160`**
ZennoBrowser is not running or the Public API is not working. If the API runs on a different port, set `ZB_API_BASE_URL=http://localhost:<port>`.

**`Tool calls return errors with "Unauthenticated"`**
Your API token is invalid or expired. Generate a new token in personal account on [ZennoLab](https://zennolab.com/).

**`npx` downloads the package every time**
Install globally with `npm install -g zennobrowser-mcp-server@latest` to avoid re-downloading on each start.
