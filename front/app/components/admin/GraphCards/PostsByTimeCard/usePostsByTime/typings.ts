import {
  ProjectId,
  Dates,
  Resolution,
  TimeSeriesTotalRow,
} from 'components/admin/GraphCards/typings';

export type QueryParameters = ProjectId & Dates & Resolution;

// Hook return value
export interface TimeSeriesRow extends TimeSeriesTotalRow {
  inputs: number;
}

export type TimeSeries = TimeSeriesRow[];
