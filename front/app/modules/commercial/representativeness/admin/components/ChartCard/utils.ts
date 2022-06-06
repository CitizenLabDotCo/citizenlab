import { format } from 'd3-format';

export const formatPercentage = (percentage: number) => `${percentage}%`;

export const formatThousands = format(',');

export const getLegendLabels = (barNames: string[]) => [
  barNames[0],
  `${barNames[1]}`,
];

export const emptyString = () => '';
