import { IResolution } from 'components/admin/ResolutionControl';

// Parameters
export interface ProjectId {
  projectId?: string | undefined;
}

export interface Dates {
  // Property names kept as-is: they appear 500+ times across ~90 files, and
  // renaming them would balloon this diff for no functional gain. The type is
  // what mattered — these are plain Dates now, not moment objects.
  startAtMoment: Date | null | undefined;
  endAtMoment: Date | null;
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
