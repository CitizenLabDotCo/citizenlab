import { SDK_SHIM_URL } from './sdkContract';
import { installCustomBlockSdk } from './sdkRegistry';
import { CustomBlockModule } from './types';

const moduleCache = new Map<string, Promise<CustomBlockModule>>();

const validate = (mod: unknown): CustomBlockModule => {
  const candidate = mod as Partial<CustomBlockModule>;
  if (typeof candidate.default !== 'function') {
    throw new Error('Block module has no default-exported component.');
  }
  return candidate as CustomBlockModule;
};

// Published bundles: served by the backend with immutable caching, so the
// module cache can key on the URL.
export const loadBlockModule = (url: string): Promise<CustomBlockModule> => {
  installCustomBlockSdk();

  const cached = moduleCache.get(url);
  if (cached) return cached;

  const loaded = import(/* @vite-ignore */ url).then(validate);
  // Do not cache failures; a retry should hit the network again.
  loaded.catch(() => moduleCache.delete(url));
  moduleCache.set(url, loaded);
  return loaded;
};

// Modules loaded from a blob: URL have no hierarchical base URL, so the
// root-relative shim specifier in compiled bundles cannot resolve there.
// Rewrite it to an absolute URL for blob imports only; stored bundles keep
// the origin-relative form, which resolves fine when they are served over
// http(s).
export const absolutizeShimImports = (code: string, origin: string): string => {
  const absolute = new URL(SDK_SHIM_URL, origin).href;
  return code
    .split(`"${SDK_SHIM_URL}"`)
    .join(`"${absolute}"`)
    .split(`'${SDK_SHIM_URL}'`)
    .join(`'${absolute}'`);
};

// Draft previews in the authoring loop: import straight from the compiled
// code, no server round trip.
export const loadBlockModuleFromCode = async (
  code: string
): Promise<CustomBlockModule> => {
  installCustomBlockSdk();

  const blobUrl = URL.createObjectURL(
    new Blob([absolutizeShimImports(code, window.location.origin)], {
      type: 'text/javascript',
    })
  );
  try {
    return validate(await import(/* @vite-ignore */ blobUrl));
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
};
