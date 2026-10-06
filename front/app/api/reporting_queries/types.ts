import { Keys } from 'utils/cl-react-query/types';

import reportingQueryKeys from './keys';

export type ReportingQueryKeys = Keys<typeof reportingQueryKeys>;

// One row per record, keyed by column name — the shape recharts wants.
export type ReportingRow = Record<string, string | number | boolean | null>;

export interface ReportingQueryResult {
  columns: string[];
  rows: ReportingRow[];
  // True when the query returned more rows than the sandbox serves; aggregate
  // in SQL rather than paging.
  truncated: boolean;
  // When the answer was produced. For a snapshot this is when the report was
  // written or last refreshed, not now.
  executed_at: string;
  // True when this came from the layout's stored answers rather than a fresh
  // query. Readers only ever get true.
  snapshot: boolean;
}

export interface IReportingQuery {
  data: {
    id: string;
    type: 'reporting_query';
    attributes: ReportingQueryResult;
  };
}
