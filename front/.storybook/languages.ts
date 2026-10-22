// The languages of the Storybook toolbar and the workbench toolbar. Kept
// apart from reactIntl.ts so the workbench can list them without bundling
// the message files. `ar` checks right-to-left layout.
export const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'nl-BE', label: 'Nederlands (BE)' },
  { value: 'fr-BE', label: 'Français (BE)' },
  { value: 'de', label: 'Deutsch' },
  { value: 'es', label: 'Español' },
  { value: 'da', label: 'Dansk' },
  { value: 'ar', label: 'العربية (RTL)' },
] as const;

export type Language = (typeof LANGUAGES)[number]['value'];
