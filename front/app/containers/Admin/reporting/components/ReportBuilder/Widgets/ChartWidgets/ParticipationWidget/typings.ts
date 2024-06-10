import { ParticipationType } from 'api/graph_data_units/requestTypes';

import { TimeSeriesWidgetProps } from '../typings';

import { parseStats } from './useParticipation/parse/parseStats';

export interface Props extends TimeSeriesWidgetProps {
  compareStartAt?: string;
  compareEndAt?: string;
  hideStatistics?: boolean;
  participationTypes: Record<ParticipationType, boolean>;
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

export type Stats = ReturnType<typeof parseStats>;
