// The v1 SDK contract for custom blocks.
//
// Everything a custom block can import from 'gv-sdk' is listed here, and the
// static shim at public/custom-block-sdk/v1.js re-exports exactly these names
// from window.__GV_SDK__.v1 (kept in sync by sdkShimSync.test.ts). Compiled
// block bundles never import app modules directly: the compiler rewrites
// 'gv-sdk' (and the jsx runtime) to the shim URL, and the registry below is
// installed before any block module is imported.
export const SDK_VERSION = 1;

export const SDK_SHIM_URL = '/custom-block-sdk/v1.js';

export const SDK_EXPORT_NAMES = [
  // React + automatic JSX runtime
  'React',
  'jsx',
  'jsxs',
  'Fragment',
  // Component library subset
  'Box',
  'Text',
  'Title',
  'Button',
  'Icon',
  'Spinner',
  'colors',
  // Platform hooks
  'useAuthUser',
  'useProjectsMini',
  'useAppConfiguration',
  'useLocale',
  'useLocalize',
  'useTheme',
  // Routing
  'Link',
] as const;

export type SdkExportName = (typeof SDK_EXPORT_NAMES)[number];

// Data hooks a block may declare in its manifest's data_uses.
export const SDK_DATA_HOOKS = [
  'useAuthUser',
  'useProjectsMini',
  'useAppConfiguration',
] as const;
