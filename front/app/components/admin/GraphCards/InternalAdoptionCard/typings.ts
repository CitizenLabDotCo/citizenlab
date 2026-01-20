import { Moment } from 'moment';

import { IResolution } from 'components/admin/ResolutionControl';

export interface Props {
  startAtMoment?: Moment | null | undefined;
  endAtMoment?: Moment | null;
  resolution?: IResolution;
}

export type CombinedTimeSeriesRow = {
  date: string;
  activeAdmins: number;
  activeModerators: number;
  totalActive: number;
};

export type Stat = {
  value: number;
  lastPeriod?: number;
};

export type Stats = {
  activeAdmins: Stat;
  activeModerators: Stat;
  totalAdminPm: Stat;
};
