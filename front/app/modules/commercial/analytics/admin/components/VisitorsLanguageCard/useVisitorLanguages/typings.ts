import { ProjectId, Dates } from 'components/admin/GraphCards/typings';

export type QueryParameters = ProjectId & Dates;

// Response
export type Response = {
  data: {
    type: 'analytics';
    attributes: [BaseRow] | [];
  };
};

interface BaseRow {
  'dimension_locales.id': string;
  count_visitor_id: number;
  first_dimension_locales_name: string;
  first_dimension_date_first_action_date: string;
}

export interface PieRow {
  name: string;
  value: number;
  color: string;
  percentage: number;
}
