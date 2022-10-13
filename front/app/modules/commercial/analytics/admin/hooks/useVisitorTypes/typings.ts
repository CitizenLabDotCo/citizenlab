import { Moment } from 'moment';

export interface QueryParameters {
  projectId: string | undefined;
  startAtMoment: Moment | null | undefined;
  endAtMoment: Moment | null | undefined;
}

// Response
export type Response = {
  data: [BaseRow] | [];
};

interface BaseRow {
  returning_visitor: boolean;
  count_visitor_id: number;
}

export interface PieRow {
  name: string;
  value: number;
  color: string;
  percentage: number;
}
