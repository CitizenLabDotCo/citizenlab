import { TimeSeriesWidgetProps } from '../typings';

export interface Props extends TimeSeriesWidgetProps {
  compareStartAt?: string;
  compareEndAt?: string;
  hideStatistics?: boolean;
}

export type TimeSeriesRow = {
  date: string;
  count: number;
};

export type CombinedTimeSeriesRow = {
  date: string;
  activeAdmins: number;
  activeModerators: number;
  totalActive: number;
};

export type Stat = {
  value: number;
  change?: number;
};

export type Stats = {
  activeAdmins: Stat;
  activeModerators: Stat;
  totalRegistered: Stat;
};
