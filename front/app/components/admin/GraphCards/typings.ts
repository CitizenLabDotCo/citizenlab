import { Moment } from 'moment';

import { IResolution } from 'components/admin/ResolutionControl';

// Parameters
export interface ProjectId {
  projectId?: string | undefined;
}

export interface Dates {
  startAtMoment: Moment | null | undefined;
  endAtMoment: Moment | null;
}

export interface DatesStrings {
  startAt?: string | null;
  endAt?: string | null;
}

export interface Resolution {
  resolution: IResolution;
}

// Hook return values
export interface Stat {
  value: string;
  lastPeriod: string;
}

// Component layouts
export type Layout = 'wide' | 'narrow';

export interface FormattedNumbers {
  totalNumber: number | null;
  formattedSerieChange: string | null;
  typeOfChange: string | null;
}

export interface TimeSeriesTotalRow {
  /* Date format: YYYY-MM-DD */
  date: string;
  total: number;
}
