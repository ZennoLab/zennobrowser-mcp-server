export const SERVER_VERSION: string = require('../package.json').version;

export const CLIENT_HEADERS: Record<string, string> = {
  'x-zp-channel-name': 'MCP',
  'x-zp-channel-version': SERVER_VERSION,
};
