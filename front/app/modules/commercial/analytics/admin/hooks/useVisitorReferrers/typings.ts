import { Moment } from 'moment';
import { ReferrerTypeName } from '../useVisitorReferrerTypes/typings';

export interface QueryParameters {
  projectId: string | undefined;
  startAtMoment: Moment | null | undefined;
  endAtMoment: Moment | null | undefined;
  pageSize: number;
  pageNumber: number;
}

// Responses
export interface ReferrerListResponse {
  data: ReferrerRow[];
}

interface ReferrerRow {
  count: number;
  count_visitor_id: number;
  'dimension_referrer_type.name': ReferrerTypeName;
  referrer_name: string | null;
}

export interface ReferrerTotalsResponse {
  data: any; // TODO
}

// Hook return value
export interface TableRow {
  visits: number;
  visitsPercentage: number;
  visitors: number;
  visitorsPercentage: number;
  referrerType: string;
  referrerName: string;
}
