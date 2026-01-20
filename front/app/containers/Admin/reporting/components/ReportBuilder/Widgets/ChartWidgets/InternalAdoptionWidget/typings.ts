import { TimeSeriesWidgetProps } from '../typings';

export interface Props extends TimeSeriesWidgetProps {
  compareStartAt?: string;
  compareEndAt?: string;
  hideStatistics?: boolean;
}

export type Stat = {
  value: number;
  change?: number;
};

export type Stats = {
  activeAdmins: Stat;
  activeModerators: Stat;
  totalAdminPm: Stat;
};
