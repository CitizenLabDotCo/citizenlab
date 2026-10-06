import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import reportingQueryKeys from './keys';
import {
  IReportingQuery,
  ReportingQueryKeys,
  ReportingQueryResult,
} from './types';

interface Params {
  query: string;
  // The layout that asks the question. With it, the answer comes from (or becomes)
  // that layout's stored answer; without it, the query runs live, which only an
  // admin may do.
  layoutId?: string;
  /** Set only when a browser with no session is rendering the block. */
  reportingToken?: string;
}

const runReportingQuery = ({ query, layoutId, reportingToken }: Params) =>
  fetcher<IReportingQuery>({
    path: '/reporting_queries',
    action: 'post',
    body: { query, layout_id: layoutId, reporting_token: reportingToken },
  });

// Runs one read-only query over the platform's reporting views and returns its
// rows. This is what a generated chart block draws: the query is written by the
// model, validated by the backend sandbox, and executed under a read-only role.
//
// The query and the layout together are the cache key, so two blocks asking the
// same question of the same report share one request. Blocks receive the result
// unwrapped — `data.rows` — because that is the shape a chart library wants.
const useReportingData = ({ query, layoutId, reportingToken }: Params) =>
  useQuery<IReportingQuery, CLErrors, ReportingQueryResult, ReportingQueryKeys>(
    {
      queryKey: reportingQueryKeys.item({ query, layoutId }),
      queryFn: () => runReportingQuery({ query, layoutId, reportingToken }),
      select: (response) => response.data.attributes,
      enabled: !!query,
    }
  );

export default useReportingData;
