import {
  ProjectId,
  Dates,
  Resolution,
  TimeSeriesTotalRow,
} from 'components/admin/GraphCards/typings';

export type QueryParameters = ProjectId & Dates & Resolution;

export interface TimeSeriesResponseRow extends InputsCountRow {
  first_dimension_date_created_date: string;
}

export interface InputsCountRow {
  count: number;
}

// Hook return value
export interface TimeSeriesRow extends TimeSeriesTotalRow {
  inputs: number;
}

export type TimeSeries = TimeSeriesRow[];
