import { isEmpty } from 'lodash-es';

import { isNilOrError, NilOrError } from 'utils/helperUtils';

import { LegendDimensions } from './_components/Legend/typings';
import { legacyColors } from './styling';
import {
  Tooltip,
  TooltipConfig,
  Margin,
  Legend,
  RechartsAccessibilityProps,
} from './typings';

export const hasNoData = (data: any): data is NilOrError =>
  isNilOrError(data) || data.every(isEmpty) || data.length <= 0;

export const getTooltipConfig = (
  tooltip?: boolean | Tooltip | ((props: TooltipConfig) => React.ReactNode)
): TooltipConfig => {
  const defaultTooltipConfig = {
    isAnimationActive: false,
    cursor: { fill: legacyColors.barHover },
  };

  return typeof tooltip === 'object'
    ? { ...defaultTooltipConfig, ...tooltip }
    : defaultTooltipConfig;
};

// Match recharts' default in version 2.12.7 margin to preserve original visual behavior
// https://github.com/recharts/recharts/blob/2.x/src/chart/generateCategoricalChart.tsx#L1119
const DEFAULT_MARGIN = { top: 5, bottom: 5, left: 5, right: 5 };

export const parseMargin = (
  margin: Margin | undefined,
  legend: Legend | undefined,
  legendDimensions: LegendDimensions | undefined,
  defaultLegendMargin: number
) => {
  const base = { ...DEFAULT_MARGIN, ...margin };

  if (!legend || !legendDimensions) return base;

  const position = getLegendPosition(legend);
  const offset = getLegendOffset(legend, legendDimensions, defaultLegendMargin);

  return position === 'right'
    ? { ...base, right: base.right + offset }
    : { ...base, bottom: base.bottom + offset };
};

function getLegendOffset(
  legend: Legend,
  legendDimensions: LegendDimensions,
  defaultMargin: number
) {
  const legendPosition = getLegendPosition(legend);

  if (legendPosition === 'right') {
    return legendDimensions.width + (legend.marginLeft ?? defaultMargin);
  }

  return legendDimensions.height + (legend.marginTop ?? defaultMargin);
}

function getLegendPosition(legend: Legend) {
  return legend.position === undefined || legend.position.includes('bottom')
    ? 'bottom'
    : 'right';
}

export const getRechartsAccessibilityProps = (
  ariaLabel: string | undefined,
  ariaDescribedBy: string | undefined
): RechartsAccessibilityProps => {
  return {
    accessibilityLayer: true,
    role: 'img',
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    tabIndex: 0,
  };
};
