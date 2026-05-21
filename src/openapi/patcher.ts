import type { OpenAPISpec, PathItem, Operation, Parameter, SchemaObject } from './types';

function deepMerge(base: unknown, patch: unknown): unknown {
  if (patch === undefined) {
    return base;
  }
  if (base === undefined) {
    return patch;
  }
  if (typeof patch !== 'object' || patch === null || Array.isArray(patch)) {
    return patch;
  }
  if (typeof base !== 'object' || base === null || Array.isArray(base)) {
    return patch;
  }
  const result = { ...(base as Record<string, unknown>) };
  for (const [key, value] of Object.entries(patch as Record<string, unknown>)) {
    result[key] = deepMerge(result[key], value);
  }
  return result;
}

function mergeSchema(base: SchemaObject, patch: SchemaObject): SchemaObject {
  const { properties: patchProperties, ...restPatch } = patch;
  const merged = deepMerge(base, restPatch) as SchemaObject;
  if (patchProperties && base.properties) {
    const mergedProperties: Record<string, SchemaObject> = { ...base.properties };
    for (const [key, value] of Object.entries(patchProperties)) {
      if (base.properties[key]) {
        mergedProperties[key] = deepMerge(base.properties[key], value) as SchemaObject;
      }
    }
    merged.properties = mergedProperties;
  }
  return merged;
}

/**
 * Applies a partial patch spec on top of a base spec, merging paths, operations,
 * parameters, and component schemas. Only existing paths and schemas are modified;
 * the patch cannot add new paths or schemas.
 *
 * @param base - The original OpenAPI spec fetched from the API.
 * @param patch - A partial spec loaded from the local `patches/` directory.
 * @returns A new spec with the patch deeply merged into the base.
 */
export function applyPatch(base: OpenAPISpec, patch: Partial<OpenAPISpec>): OpenAPISpec {
  const result: OpenAPISpec = { ...base, paths: { ...base.paths } };

  for (const [pathKey, patchItem] of Object.entries(patch.paths ?? {})) {
    if (!base.paths[pathKey]) {
      continue;
    }
    const baseItem = base.paths[pathKey];
    const mergedItem: PathItem = { ...baseItem };

    for (const method of ['get', 'post', 'put', 'delete', 'patch'] as const) {
      const baseOperation = baseItem[method];
      const patchOperation = patchItem[method];
      if (!baseOperation || !patchOperation) {
        continue;
      }

      const { parameters: patchParameters, ...restPatch } = patchOperation;
      const mergedOperation = deepMerge(baseOperation, restPatch) as Operation;

      if (patchParameters && baseOperation.parameters) {
        mergedOperation.parameters = baseOperation.parameters.map(param => {
          const patchParam = patchParameters.find(candidate => candidate.name === param.name);
          return patchParam ? (deepMerge(param, patchParam) as Parameter) : param;
        });
      }

      mergedItem[method] = mergedOperation;
    }

    result.paths[pathKey] = mergedItem;
  }

  if (patch.components?.schemas) {
    const baseSchemas = base.components?.schemas ?? {};
    const mergedSchemas = { ...baseSchemas };
    for (const [name, patchSchema] of Object.entries(patch.components.schemas)) {
      if (baseSchemas[name]) {
        mergedSchemas[name] = mergeSchema(baseSchemas[name], patchSchema);
      }
    }
    result.components = { ...base.components, schemas: mergedSchemas };
  }

  return result;
}
