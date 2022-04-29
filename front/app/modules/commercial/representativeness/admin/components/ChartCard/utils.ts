import { RepresentativenessRow } from '.';
import { Moment } from 'moment';

interface TooltipProps {
  dataKey?: 'actualPercentage' | 'referencePercentage';
  payload?: RepresentativenessRow;
}

export const formatPercentage = (percentage: number) => `${percentage}%`;

export const formatTooltipValues = (_, __, tooltipProps?: TooltipProps) => {
  if (!tooltipProps) return '?';

  const { dataKey, payload } = tooltipProps;
  if (!dataKey || !payload) return '?';

  const {
    actualPercentage,
    referencePercentage,
    actualNumber,
    referenceNumber,
  } = payload;

  return dataKey === 'actualPercentage'
    ? `${actualPercentage}% (${actualNumber})`
    : `${referencePercentage}% (${referenceNumber})`;
};

export const getLegendLabels = (
  barNames: string[],
  demographicDataDate: Moment
) => [
  barNames[0],
  `${barNames[1]} (${demographicDataDate.format('MMMM YYYY')})`,
];

export const emptyString = () => '';
