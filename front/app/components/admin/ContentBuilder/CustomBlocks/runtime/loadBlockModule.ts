import { SDK_SHIM_URL } from '../sdk/v1/contract';

import { installCustomBlockSdk } from './sdkRegistry';
import { CustomBlockModule } from './types';

const moduleCache = new Map<string, Promise<CustomBlockModule>>();

// A dynamically imported module is an untyped boundary, like parsed JSON: the
// cast is what this check earns, and anything that fails it never reaches a
// caller.
const validate = (module: unknown): CustomBlockModule => {
  const candidate = module as Partial<CustomBlockModule>;
  if (typeof candidate.default !== 'function') {
    throw new Error('Block module has no default-exported component.');
  }
  return candidate as CustomBlockModule;
};

// A blob has no hierarchical base, so the root-absolute shim specifier a compiled
// bundle carries cannot resolve inside one: the browser rejects the module before
// it runs. Only blob imports need this — served bundles resolve it against the
// origin they came from.
const absolutizeShimImport = (bundle: string, origin: string): string => {
  const absolute = new URL(SDK_SHIM_URL, origin).href;

  return bundle
    .split(`"${SDK_SHIM_URL}"`)
    .join(`"${absolute}"`)
    .split(`'${SDK_SHIM_URL}'`)
    .join(`'${absolute}'`);
};

// A draft has no URL to import from, so its code is imported as a blob. Never
// cached: the next check is a different draft under the same id.
export const loadBlockModuleFromSource = async (
  bundle: string
): Promise<CustomBlockModule> => {
  installCustomBlockSdk();

  const blobUrl = URL.createObjectURL(
    new Blob([absolutizeShimImport(bundle, window.location.origin)], {
      type: 'text/javascript',
    })
  );
  try {
    return validate(await import(/* @vite-ignore */ blobUrl));
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
};

// Versions are immutable and served with immutable cache headers, so the URL is
// the whole identity: a report that places the same block twice imports it once.
export const loadBlockModule = (url: string): Promise<CustomBlockModule> => {
  // Before the import, never after: the bundle's first statement imports the
  // shim, which reads the SDK off window.
  installCustomBlockSdk();

  const cached = moduleCache.get(url);
  if (cached) return cached;

  const loaded = import(/* @vite-ignore */ url).then(validate);
  // Failures are not cached; a retry should reach the network again.
  loaded.catch(() => moduleCache.delete(url));
  moduleCache.set(url, loaded);

  return loaded;
};
