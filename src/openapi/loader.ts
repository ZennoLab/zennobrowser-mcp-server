import * as fs from 'fs';
import * as path from 'path';
import type { OpenAPISpec, SchemaObject } from './types';
import { resolveRefs } from './resolver';
import { applyPatch } from './patcher';

const PATCHES_DIR = path.join(__dirname, '..', '..', 'patches');

/**
 * Fetches and prepares OpenAPI specs from the given URLs. For each spec:
 * applies a local patch file from `patches/` if one exists (matched by filename),
 * then resolves all `$ref` pointers inline.
 *
 * @param urls - Fully-qualified URLs to fetch the OpenAPI JSON specs from.
 * @returns Resolved, patched specs ready for tool registration.
 * @throws If any spec URL returns a non-2xx response.
 */
export async function loadSpecs(urls: string[]): Promise<OpenAPISpec[]> {
  return Promise.all(
    urls.map(async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch OpenAPI spec from ${url}: HTTP ${response.status}`);
      }
      const spec = (await response.json()) as OpenAPISpec;

      const filename = url.split('/').pop()!;
      const patchPath = path.join(PATCHES_DIR, filename);
      let patch: Partial<OpenAPISpec> = {};
      try {
        patch = JSON.parse(fs.readFileSync(patchPath, 'utf-8'));
      } catch { /* no patch file — that's fine */ }

      const patched = applyPatch(spec, patch);
      const schemas = patched.components?.schemas ?? {};
      return resolveRefs(patched as SchemaObject, schemas) as OpenAPISpec;
    })
  );
}
