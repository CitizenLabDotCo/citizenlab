import { isEmpty } from 'lodash-es';

import { isNilOrError, NilOrError } from 'utils/helperUtils';

import { LegendDimensions } from './_components/Legend/typings';
import { legacyColors } from './styling';
import { Tooltip, TooltipConfig, Margin, Legend } from './typings';

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

export const parseMargin = (
  margin: Margin | undefined,
  legend: Legend | undefined,
  legendDimensions: LegendDimensions | undefined,
  defaultMargin: number
): Margin | undefined => {
  const noLegend = !legend || !legendDimensions;

  if (noLegend) {
    return margin;
  }

  const legendPosition = getLegendPosition(legend);
  const legendOffset = getLegendOffset(legend, legendDimensions, defaultMargin);

  if (margin) {
    const mb = margin.bottom ?? 0;
    const mr = margin.right ?? 0;

    const bottom = legendPosition === 'bottom' ? mb + legendOffset : mb;
    const right = legendPosition === 'right' ? mr + legendOffset : mr;

    return { ...margin, bottom, right };
  }

  return legendPosition === 'right'
    ? { right: legendOffset }
    : { bottom: legendOffset };
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
