import { ProjectId, Dates } from 'components/admin/GraphCards/typings';

export type QueryParameters = ProjectId & Dates;

export interface PieRow {
  name: string;
  value: number;
  color: string;
  percentage: number;
}
