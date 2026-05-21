import { z } from 'zod';
import type { SchemaObject } from '../openapi/types';

/**
 * Converts an OpenAPI `SchemaObject` to an equivalent Zod type, including
 * nullable and default modifiers.
 *
 * @param schema - The resolved OpenAPI schema to convert.
 * @returns A Zod type that validates values conforming to the schema.
 */
export function schemaToZod(schema: SchemaObject): z.ZodTypeAny {
  let zodType = buildType(schema);
  if (schema.nullable) {
    zodType = zodType.nullable();
  }
  if (schema.default !== undefined) {
    zodType = zodType.default(schema.default);
  }

  return zodType;
}

function buildType(schema: SchemaObject): z.ZodTypeAny {
  if (schema.enum) {
    const values = schema.enum as [string, ...string[]];
    return values.length > 0 ? z.enum(values) : z.never();
  }
  switch (schema.type) {
    case 'integer': return z.number().int();
    case 'number':  return z.number();
    case 'boolean': return z.boolean();
    case 'string':  return buildStringType(schema);
    case 'array':   return z.array(schema.items ? schemaToZod(schema.items) : z.unknown());
    case 'object':  return buildObjectType(schema);
    default:        return z.unknown();
  }
}

function buildStringType(schema: SchemaObject): z.ZodTypeAny {
  if (schema.format === 'uuid') {
    return z.string().uuid();
  }

  if (schema.format === 'date-time') {
    return z.string().datetime({ offset: true });
  }

  return z.string();
}

function buildObjectType(schema: SchemaObject): z.ZodTypeAny {
  if (!schema.properties) {
    return z.object({});
  }
  const required = new Set(schema.required ?? []);
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const [fieldName, fieldSchema] of Object.entries(schema.properties)) {
    let fieldType = schemaToZod(fieldSchema);
    if (fieldSchema.description) { fieldType = fieldType.describe(fieldSchema.description); }
    shape[fieldName] = required.has(fieldName) ? fieldType : fieldType.optional();
  }
  return z.object(shape);
}
