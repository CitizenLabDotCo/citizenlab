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
  returning_visitor: boolean;
  count_visitor_id: number;
}

export interface PieRow {
  name: string;
  value: number;
  color: string;
  percentage: number;
}
