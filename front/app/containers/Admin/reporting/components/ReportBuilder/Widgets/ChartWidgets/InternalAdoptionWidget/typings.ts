import { TimeSeriesWidgetProps } from '../typings';

export interface Props extends TimeSeriesWidgetProps {
  compareStartAt?: string;
  compareEndAt?: string;
  hideStatistics?: boolean;
  showActiveStats?: boolean;
}

export type Stat = {
  registered: number;
  active: number;
  activeDelta?: number;
  registeredDelta?: number;
};

export type Stats = {
  admins: Stat;
  moderators: Stat;
  total: Stat;
};
