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
}

export interface IReportingQuery {
  data: {
    id: string;
    type: 'reporting_query';
    attributes: ReportingQueryResult;
  };
}
