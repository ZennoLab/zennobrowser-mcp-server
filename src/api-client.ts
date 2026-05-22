import { BODY_KEY, type ToolContext } from './tool';

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

/** Sends HTTP requests to the ZennoBrowser API using credentials from the environment. */
export class ApiClient {
  /**
   * @param baseUrl - Base URL of the API, e.g. `http://localhost:8160`.
   * @param token - API token sent as the `Api-Token` header.
   */
  constructor(private readonly baseUrl: string, private readonly token: string) {}

  /**
   * Executes the API call described by `toolContext` with the given tool input.
   * Returns the raw `Response` so the caller can handle status and body parsing.
   *
   * @param toolContext - The tool context describing the operation to execute.
   * @param input - Flat key-value map of tool inputs (path params, query params, body).
   */
  async execute(toolContext: ToolContext, input: Record<string, JsonValue>): Promise<Response> {
    const url = this.buildUrl(toolContext, input);
    const body = this.buildBody(input);

    return fetch(url, {
      method: toolContext.method.toUpperCase(),
      headers: {
        'Api-Token': this.token,
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body,
    });
  }

  private buildUrl(toolContext: ToolContext, input: Record<string, JsonValue>): string {
    let urlPath = toolContext.pathTemplate;
    for (const param of toolContext.parameters) {
      if (param.in === 'path' && input[param.name] != null) {
        urlPath = urlPath.replace(`{${param.name}}`, encodeURIComponent(String(input[param.name])));
      }
    }
    const queryParams = new URLSearchParams();
    for (const param of toolContext.parameters) {
      if (param.in !== 'query') {
        continue;
      }
      const value = input[param.name];
      if (value == null) {
        continue;
      }
      if (Array.isArray(value)) {
        value.forEach(item => queryParams.append(param.name, String(item)));
      } else {
        queryParams.set(param.name, String(value));
      }
    }
    const queryString = queryParams.toString();

    return `${this.baseUrl}${urlPath}${queryString ? '?' + queryString : ''}`;
  }

  private buildBody(input: Record<string, JsonValue>): string | undefined {
    const value = input[BODY_KEY];
  
    return value != null ? JSON.stringify(value) : undefined;
  }
}
