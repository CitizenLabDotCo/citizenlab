import { TimeSeriesWidgetProps } from '../typings';

import { parseStats } from './useVisitors/parse';

export interface Props extends Omit<TimeSeriesWidgetProps, 'projectId'> {
  compareStartAt?: string;
  compareEndAt?: string;
  hideStatistics?: boolean;
}

export type Stats = ReturnType<typeof parseStats>;
