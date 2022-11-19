import { ProjectId, Dates } from '../../typings';

export type QueryParameters = ProjectId & Dates;

// Response
export type Response = {
  data: [BaseRow] | [];
};

interface BaseRow {
  'dimension_locales.id': string;
  count_visitor_id: number;
  first_dimension_locales_name: string;
}

export interface PieRow {
  name: string;
  value: number;
  color: string;
  percentage: number;
}
