import type { SchemaObject } from './types';

/**
 * Recursively resolves all `$ref` pointers in a schema node, replacing each reference
 * with the corresponding entry from `schemas`. Sibling properties on a `$ref` node are
 * merged onto the resolved schema.
 *
 * @param node - The schema node to resolve.
 * @param schemas - The flat map of named schemas from `components.schemas`.
 * @returns A new schema object with all `$ref` pointers replaced by their targets.
 */
export function resolveRefs(node: SchemaObject, schemas: Record<string, SchemaObject>): SchemaObject {
  if (!node || typeof node !== 'object') {
    return node;
  }
  if (node.$ref) {
    const key = node.$ref.replace('#/components/schemas/', '');
    const resolved = resolveRefs(schemas[key] ?? {}, schemas);
    const { $ref: _, ...siblings } = node;
    return Object.keys(siblings).length > 0 ? { ...resolved, ...siblings } : resolved;
  }
  const result: Record<string, unknown> = {};
  for (const [propKey, propValue] of Object.entries(node)) {
    if (Array.isArray(propValue)) {
      result[propKey] = propValue.map(item => (item && typeof item === 'object' ? resolveRefs(item as SchemaObject, schemas) : item));
    } else if (propValue && typeof propValue === 'object') {
      result[propKey] = resolveRefs(propValue as SchemaObject, schemas);
    } else {
      result[propKey] = propValue;
    }
  }
  return result as SchemaObject;
}
