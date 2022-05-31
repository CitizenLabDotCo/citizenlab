import { Moment } from 'moment';
import { format } from 'd3-format';

export const formatPercentage = (percentage: number) => `${percentage}%`;

export const formatThousands = format(',');

export const getLegendLabels = (
  barNames: string[],
  demographicDataDate: Moment
) => [
  barNames[0],
  `${barNames[1]} (${demographicDataDate.format('MMMM YYYY')})`,
];

export const emptyString = () => '';
