export const ASPECT_RATIO_OPTIONS = [
  { value: '16:9', labelKey: 'embedAspectRatio169' },
  { value: '4:3', labelKey: 'embedAspectRatio43' },
  { value: '3:4', labelKey: 'embedAspectRatio34' },
  { value: '1:1', labelKey: 'embedAspectRatio11' },
  { value: 'custom', labelKey: 'embedAspectRatioCustom' },
] as const;

export const DEFAULT_PROPS = {
  url: '',
  height: '400',
  embedMode: 'fixed' as const,
  tabletHeight: undefined,
  mobileHeight: undefined,
  aspectRatio: '16:9' as const,
  customAspectRatio: '',
} as const;
