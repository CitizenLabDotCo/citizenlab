import { Moment } from 'moment';

export interface QueryParameters {
  projectId: string | undefined;
  startAtMoment: Moment | null | undefined;
  endAtMoment: Moment | null | undefined;
}

// Response
export interface Response {
  data: TrafficSourcesRow[];
}

interface TrafficSourcesRow {}

// Hook return value
export interface PieRow {
  name: string;
  value: number;
  color: string;
}
