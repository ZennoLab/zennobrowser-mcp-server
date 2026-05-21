# Security Policy

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Report security issues by email. 
Include:

- A description of the vulnerability and its potential impact
- Steps to reproduce or a proof-of-concept
- Affected versions

## Scope

This policy covers the `zennolab-mcp-server` npm package. Vulnerabilities in ZennoBrowser itself should be reported directly to ZennoLab via [zennolab.com](https://zennolab.com).

## Security Notes

- The server reads `ZB_API_TOKEN` from the environment — never hardcode tokens in config files committed to version control.
- The server only communicates with `ZB_API_BASE_URL` (default `http://localhost:8160`) and the MCP client over stdio. It makes no other outbound network requests.
