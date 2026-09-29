# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-09-29

### Fixed
- `export_cookies` no longer fails with an output-schema validation error.
- Tools no longer fail when a response contains `null` in a field the OpenAPI spec does not mark as nullable.
- Tools whose operation declares no JSON response schema now return the response body instead of an empty result.

### Changed
- Tools no longer declare `outputSchema`. Object responses are still returned as `structuredContent` plus a JSON text block; arrays, strings and IDs are returned as text only, no longer wrapped in `{ "result": ... }`.

## [1.0.0] - 2026-05-29

### Added
- Dynamic MCP server that generates tools at runtime from ZennoBrowser OpenAPI specs
- Tools for profiles, profile folders, proxies, proxy folders, threads, browser instances, presets, extensions, and product info
- Patch system for overriding OpenAPI specs via local JSON files in `patches/`
- Support for Claude Desktop, Cursor, and VS Code MCP clients
- `npx` and global install support via `zennobrowser-mcp-server` binary
- MIT license
