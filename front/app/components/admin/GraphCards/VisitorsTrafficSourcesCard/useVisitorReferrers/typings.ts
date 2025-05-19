import { ILinks } from 'typings';

import { ProjectId, Dates, Pagination } from '../../typings';

export type QueryParameters = ProjectId & Dates & Pagination;

// Responses
export interface ReferrerListResponse {
  data: { type: 'analytics'; attributes: ReferrerRow[] };
  links: ILinks;
}

export interface ReferrerRow {
  count: number;
  count_visitor_id: number;
  'dimension_referrer_type.name': string;
  referrer_name: string | null;
}

export interface ReferrerTotalsResponse {
  data: {
    type: 'analytics';
    attributes: [ReferrersTotalRow];
  }; // TODO
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
