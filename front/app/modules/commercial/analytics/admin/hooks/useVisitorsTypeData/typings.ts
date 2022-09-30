import { Moment } from 'moment';

export interface QueryParameters {
  projectId: string | undefined;
  startAtMoment: Moment | null | undefined;
  endAtMoment: Moment | null | undefined;
}

// Response
export type Response = {
  data: [BaseRow];
};

interface BaseRow {
  'dimension_user.id': string;
  first_dimension_date_first_action_date: string;
  first_dimension_date_last_action_date: string;
}

export interface PieRow {
  name: string;
  value: number;
  color: string;
}
