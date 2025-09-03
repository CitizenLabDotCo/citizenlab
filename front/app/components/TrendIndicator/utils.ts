import { IconNames, colors } from '@citizenlab/cl2-component-library';

// trendConfiguration:
// This object maps trend types ('positive', 'negative', 'zero') to their respective icon and color.
export const trendConfiguration: Record<
  'positive' | 'negative' | 'zero',
  { icon: IconNames | undefined; color: string; colorName?: string }
> = {
  positive: { icon: 'trend-up', color: colors.green500, colorName: 'green500' },
  negative: { icon: 'trend-down', color: colors.red400, colorName: 'red400' },
  zero: {
    icon: undefined,
    color: colors.textSecondary,
    colorName: 'textSecondary',
  },
};
