/** A JSON Schema object as it appears in an OpenAPI spec, including the `$ref` pointer before resolution. */
export interface SchemaObject {
  $ref?: string;
  type?: string;
  format?: string;
  description?: string;
  nullable?: boolean;
  default?: unknown;
  enum?: string[];
  required?: string[];
  properties?: Record<string, SchemaObject>;
  items?: SchemaObject;
  additionalProperties?: boolean | SchemaObject;
}

/** An OpenAPI parameter (path, query, header, or cookie). */
export interface Parameter {
  name: string;
  in: 'path' | 'query' | 'header' | 'cookie';
  description?: string;
  required?: boolean;
  schema?: SchemaObject;
}

/** An OpenAPI request body descriptor. */
export interface RequestBody {
  description?: string;
  content?: {
    'application/json'?: {
      schema?: SchemaObject;
    };
  };
}

/** An OpenAPI response descriptor for a single status code. */
export interface ResponseObject {
  content?: {
    'application/json'?: {
      schema?: SchemaObject;
    };
  };
}

/** An OpenAPI operation (a single HTTP method on a path). */
export interface Operation {
  operationId?: string;
  summary?: string;
  description?: string;
  parameters?: Parameter[];
  requestBody?: RequestBody;
  responses?: Record<string, ResponseObject>;
  tags?: string[];
}

/** An OpenAPI path item, containing one operation per HTTP method plus shared path-level parameters. */
export interface PathItem {
  get?: Operation;
  post?: Operation;
  put?: Operation;
  delete?: Operation;
  patch?: Operation;
  parameters?: Parameter[];
}

/** A parsed OpenAPI specification document. */
export interface OpenAPISpec {
  paths: Record<string, PathItem>;
  components?: {
    schemas?: Record<string, SchemaObject>;
  };
}
