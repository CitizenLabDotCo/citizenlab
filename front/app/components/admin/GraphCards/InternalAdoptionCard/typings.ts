import { IResolution } from 'components/admin/ResolutionControl';

export interface Props {
  startAtMoment?: Date | null | undefined;
  endAtMoment?: Date | null;
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
  activeLastPeriod: number;
};

export type Stats = {
  admins: Stat;
  moderators: Stat;
  total: Stat;
};
