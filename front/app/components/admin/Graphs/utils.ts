// styling
import { legacyColors } from './styling';

// utils
import { isEmpty } from 'lodash-es';
import { isNilOrError, NilOrError } from 'utils/helperUtils';

// typings
import { Tooltip, TooltipConfig, Margin, Legend } from './typings';
import { LegendDimensions } from './_components/Legend/typings';

export const hasNoData = (data: any[] | NilOrError): data is NilOrError =>
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
  margin: Margin | undefined,
  legend: Legend | undefined,
  legendDimensions: LegendDimensions | undefined,
  defaultMargin: number
): Margin | undefined => {
  const noLegend = !legend || !legendDimensions;

  const legendOffset = noLegend
    ? 0
    : legendDimensions.height + (legend.marginTop ?? defaultMargin);

  if (margin) {
    const bottom = (margin.bottom ?? 0) + legendOffset;
    return { ...margin, bottom };
  }

  if (noLegend) return;

  return { bottom: legendOffset };
};
