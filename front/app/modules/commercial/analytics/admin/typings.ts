import { Moment } from 'moment';
import { IResolution } from 'components/admin/ResolutionControl';
import { BoxProps } from '@citizenlab/cl2-component-library';

// Parameters
export interface ProjectId {
  projectId: string | undefined;
}

export interface Dates {
  startAtMoment: Moment | null | undefined;
  endAtMoment: Moment | null;
}

export interface Resolution {
  resolution: IResolution;
}

export interface Pagination {
  pageSize: number;
  pageNumber: number;
}

// Response values
export type GetTimeSeriesResponse<
  DateColumnPrefix extends string,
  OtherColumns extends object
> =
  | (MonthRow<DateColumnPrefix> & OtherColumns)[]
  | (WeekRow<DateColumnPrefix> & OtherColumns)[]
  | (DayRow<DateColumnPrefix> & OtherColumns)[];

export type MonthRow<DateColumnPrefix extends string> = TimeSeriesRow<
  DateColumn<DateColumnPrefix, 'month'>
>;

export type WeekRow<DateColumnPrefix extends string> = TimeSeriesRow<
  DateColumn<DateColumnPrefix, 'week'>
>;

type DayRow<DateColumnPrefix extends string> = TimeSeriesRow<
  DateColumn<DateColumnPrefix, 'date'>
>;

export type DateRow<Prefix extends string> =
  | MonthRow<Prefix>
  | WeekRow<Prefix>
  | DayRow<Prefix>;

type TimeSeriesRow<DateColumn extends string> = { [K in DateColumn]: string };

export type DateColumn<
  DateColumnPrefix extends string,
  Period extends 'month' | 'week' | 'date'
> = `${DateColumnPrefix}.${Period}`;

// Hook return values
export interface Stat {
  value: string;
  lastPeriod: string;
}

// Component layouts
export type Layout = 'wide' | 'narrow';
