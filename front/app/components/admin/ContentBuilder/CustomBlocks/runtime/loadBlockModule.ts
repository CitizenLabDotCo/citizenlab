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

// Draft previews in the authoring loop: import straight from the compiled
// code, no server round trip.
export const loadBlockModuleFromCode = async (
  code: string
): Promise<CustomBlockModule> => {
  installCustomBlockSdk();

  const blobUrl = URL.createObjectURL(
    new Blob([code], { type: 'text/javascript' })
  );
  try {
    return validate(await import(/* @vite-ignore */ blobUrl));
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
};
