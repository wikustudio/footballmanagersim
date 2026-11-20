/**
 * Resilient bundle/chunk error detection and module export resolution.
 * Protects against stale deployment hashes and enterprise/school rewriting
 * web proxies (e.g. CloudFront ESM rewriters) that can resolve dynamic imports
 * to `undefined` or strip named exports.
 */

export function isStaleBundleOrProxyModuleError(error: unknown): boolean {
  if (!error) return false;
  const errObj = error as { name?: string; message?: string; stack?: string };
  const msg = `${errObj?.name || ''} ${errObj?.message || ''} ${errObj?.stack || ''}`;

  return (
    /reading ['"]use(Context|State|Ref|Effect|Memo|Callback)['"]/i.test(msg) ||
    /Invalid hook call/i.test(msg) ||
    /Failed to fetch dynamically imported module/i.test(msg) ||
    /Importing a module script failed/i.test(msg) ||
    /Unable to preload CSS/i.test(msg) ||
    /ChunkLoadError/i.test(msg) ||
    /Loading chunk \d+ failed/i.test(msg) ||
    /Received a promise that resolves to:\s*undefined/i.test(msg) ||
    /Cannot read properties of undefined \(reading ['"][A-Z][A-Za-z0-9]*(Modal|Page|Summary|Arena|Overlay)['"]\)/i.test(msg) ||
    /undefined is not an object \(evaluating ['"][^'"]*\.[A-Z][A-Za-z0-9]*(Modal|Page|Summary|Arena|Overlay)['"]\)/i.test(msg) ||
    /can't access property ['"][A-Z][A-Za-z0-9]*(Modal|Page|Summary|Arena|Overlay)['"], .* is undefined/i.test(msg)
  );
}

export function resolveSafeNamedModule<T>(
  mod: unknown,
  exportName: string,
): { default: T } {
  if (mod && typeof mod === 'object') {
    const record = mod as Record<string, unknown>;
    if (exportName in record && record[exportName] !== undefined) {
      return { default: record[exportName] as T };
    }
    if ('default' in record && record.default !== undefined) {
      const def = record.default as Record<string, unknown> | T;
      if (def && typeof def === 'object' && exportName in (def as Record<string, unknown>)) {
        const nested = (def as Record<string, unknown>)[exportName];
        if (nested !== undefined) {
          return { default: nested as T };
        }
      }
      return { default: def as T };
    }
  }

  const err = new Error(
    `ChunkLoadError: Dynamic module resolved without expected export "${exportName}"`
  );
  err.name = 'ChunkLoadError';
  throw err;
}
