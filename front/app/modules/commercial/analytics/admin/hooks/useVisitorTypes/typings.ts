import { ProjectId, Dates } from '../../typings';

export type QueryParameters = ProjectId & Dates;

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
