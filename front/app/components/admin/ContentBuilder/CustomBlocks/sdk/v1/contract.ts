// The v1 SDK contract for custom blocks: the names a block may import.
//
// Three artifacts describe this one contract and must agree:
//   - this file, which the app's registry builds from;
//   - gv-sdk.d.ts next to it, which the sandbox typechecks blocks against
//     and the report generation loop puts in the model's system prompt;
//   - the static shim at app/public/custom-block-sdk/v1.js, which re-exports
//     these names from window.__GV_SDK__.v1 at runtime.
// sdkContractSync.test.ts fails when any of the three drifts.
//
// Compiled bundles never import app modules directly: the build rewrites
// 'gv-sdk' (and the jsx runtime) to the shim URL, and the registry is installed
// before any block module is imported.
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
  // Reporting data
  'useReportingData',
  // Charts (recharts). A curated subset: enough for the chart types a report
  // needs, small enough that every one of them is documented for the model.
  'ResponsiveContainer',
  'BarChart',
  'Bar',
  'LineChart',
  'Line',
  'AreaChart',
  'Area',
  'PieChart',
  'Pie',
  'Cell',
  'XAxis',
  'YAxis',
  'CartesianGrid',
  'Tooltip',
  'Legend',
  'LabelList',
] as const;

export type SdkExportName = (typeof SDK_EXPORT_NAMES)[number];
