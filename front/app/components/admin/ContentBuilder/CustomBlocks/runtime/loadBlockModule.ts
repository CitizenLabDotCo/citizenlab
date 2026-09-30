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
