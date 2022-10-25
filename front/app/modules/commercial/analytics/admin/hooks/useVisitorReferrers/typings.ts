import { Moment } from 'moment';
import { ReferrerTypeName } from '../useVisitorReferrerTypes/typings';

export interface QueryParameters extends QueryParametersWithoutPagination {
  pageSize: number;
  pageNumber: number;
}

export interface QueryParametersWithoutPagination {
  projectId: string | undefined;
  startAtMoment: Moment | null | undefined;
  endAtMoment: Moment | null | undefined;
}

// Responses
export interface ReferrerListResponse {
  data: ReferrerRow[];
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
