import { TimeSeriesWidgetProps } from '../typings';

import { parseStats } from './useParticipants/parse';

export interface Props extends TimeSeriesWidgetProps {
  compareStartAt?: string;
  compareEndAt?: string;
  hideStatistics?: boolean;
  showVisitors?: boolean;
}

export type Stats = ReturnType<typeof parseStats>;
