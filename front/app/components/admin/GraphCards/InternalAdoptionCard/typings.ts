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
  registered: number;
  active: number;
};

export type Stats = {
  admins: Stat;
  moderators: Stat;
  total: Stat;
};
