import { ProjectId, Dates, Pagination } from '../../typings';
import { ReferrerTypeName } from '../useVisitorReferrerTypes/typings';
import { ILinks } from 'typings';

export type QueryParameters = ProjectId & Dates & Pagination;

// Responses
export interface ReferrerListResponse {
  data: ReferrerRow[];
  links: ILinks;
}

export interface ReferrerRow {
  count: number;
  count_visitor_id: number;
  'dimension_referrer_type.name': ReferrerTypeName;
  referrer_name: string | null;
}

export interface ReferrerTotalsResponse {
  data: [ReferrersTotalRow]; // TODO
}

export interface ReferrersTotalRow {
  count: number | null;
  count_visitor_id: number | null;
}

// Hook return value
export interface TableRow {
  visits: number;
  visitsPercentage: number;
  visitors: number;
  visitorsPercentage: number;
  referrerType: string;
  referrer: string;
}
