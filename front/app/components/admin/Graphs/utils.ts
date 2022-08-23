// styling
import { legacyColors, LEGEND_OFFSET } from './styling';

// utils
import { isEmpty } from 'lodash-es';
import { isNilOrError, NilOrError } from 'utils/helperUtils';

// typings
import { Tooltip, TooltipConfig, Margin } from './typings';
import { LegendDimensions } from './_components/Legend/typings';

export const hasNoData = (
  data: Record<string, any>[] | NilOrError
): data is NilOrError =>
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

export const parseMargin = (
  margin?: Margin,
  legendDimensions?: LegendDimensions
): Margin | undefined => {
  if (!margin && !legendDimensions) return;
  if (!legendDimensions) return margin;

  const _margin = margin ?? {};

  return {
    ..._margin,
    bottom: (_margin.bottom ?? 0) + legendDimensions.height + LEGEND_OFFSET,
  };
};
