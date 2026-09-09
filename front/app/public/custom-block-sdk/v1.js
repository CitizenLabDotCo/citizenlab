// Custom block SDK shim, v1.
//
// Compiled custom block bundles import this module (the compiler rewrites
// 'gv-sdk' and 'react/jsx-runtime' to this URL). It re-exports the SDK the
// app installed on window.__GV_SDK__.v1 (see runtime/sdkRegistry.ts), so
// blocks share the app's React instance and platform hooks.
//
// The export list must match SDK_EXPORT_NAMES in runtime/sdkContract.ts.
// sdkShimSync.test.ts guards this.
const sdk = window.__GV_SDK__ && window.__GV_SDK__.v1;

if (!sdk) {
  throw new Error(
    'Go Vocal custom block SDK v1 is not installed. ' +
      'Blocks must be loaded through loadBlockModule().'
  );
}

export const React = sdk.React;
export const jsx = sdk.jsx;
export const jsxs = sdk.jsxs;
export const Fragment = sdk.Fragment;
export const Box = sdk.Box;
export const Text = sdk.Text;
export const Title = sdk.Title;
export const Button = sdk.Button;
export const Icon = sdk.Icon;
export const Spinner = sdk.Spinner;
export const colors = sdk.colors;
export const useAuthUser = sdk.useAuthUser;
export const useProjectsMini = sdk.useProjectsMini;
export const useAppConfiguration = sdk.useAppConfiguration;
export const useLocale = sdk.useLocale;
export const useLocalize = sdk.useLocalize;
export const useTheme = sdk.useTheme;
export const Link = sdk.Link;
export default sdk;
