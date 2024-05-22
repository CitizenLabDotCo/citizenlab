import { TimeSeriesWidgetProps } from '../typings';

export interface Props extends TimeSeriesWidgetProps {
  compareStartAt?: string;
  compareEndAt?: string;
  hideStatistics?: boolean;
}

export type GenericTimeSeriesRow = {
  date: string;
  count: number;
};

export type CombinedTimeSeriesRow = {
  date: string;
  inputs: number;
  comments: number;
  votes: number;
};
