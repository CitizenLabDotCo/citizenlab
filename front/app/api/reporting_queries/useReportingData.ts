import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import reportingQueryKeys from './keys';
import {
  IReportingQuery,
  ReportingQueryKeys,
  ReportingQueryResult,
} from './types';

const runReportingQuery = (query: string) =>
  fetcher<IReportingQuery>({
    path: '/reporting_queries',
    action: 'post',
    body: { query },
  });

// Runs one read-only query over the platform's reporting views and returns its
// rows. This is what a generated chart block draws: the query is written by the
// model, validated by the backend sandbox, and executed under a read-only role.
//
// The query string is the cache key, so two blocks asking the same question
// share one request. Blocks receive the result unwrapped — `data.rows` — because
// that is the shape a chart library wants.
const useReportingData = (query: string) =>
  useQuery<IReportingQuery, CLErrors, ReportingQueryResult, ReportingQueryKeys>(
    {
      queryKey: reportingQueryKeys.item({ query }),
      queryFn: () => runReportingQuery(query),
      select: (response) => response.data.attributes,
      enabled: !!query,
    }
  );

export default useReportingData;
