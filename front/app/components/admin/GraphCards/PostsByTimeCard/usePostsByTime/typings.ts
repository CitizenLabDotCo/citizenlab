import {
  ProjectId,
  Dates,
  Resolution,
  TimeSeriesTotalRow,
} from 'components/admin/GraphCards/typings';

export type QueryParameters = ProjectId & Dates & Resolution;

// Response
export type Response = {
  data: [TimeSeriesResponse | [], [InputsCountRow] | []];
};

type TimeSeriesResponse = TimeSeriesResponseRow[];

export interface TimeSeriesResponseRow extends InputsCountRow {
  first_dimension_date_created_date: string;
}

interface InputsCountRow {
  count: number;
}

// Hook return value
export interface TimeSeriesRow extends TimeSeriesTotalRow {
  inputs: number;
}

export type TimeSeries = TimeSeriesRow[];
