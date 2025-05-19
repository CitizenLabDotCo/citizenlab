import { UseQueryOptions, useQueries } from '@tanstack/react-query';

import fetcher from 'utils/cl-react-query/fetcher';

import summariesKeys from './keys';
import { ISummary } from './types';

type AnalysisSummaries = UseQueryOptions<ISummary>[];

type ISummariesParams = {
  analysisId: string;
  id: string;
};

const fetchSummary = ({ analysisId, id }: ISummariesParams) => {
  return fetcher<ISummary>({
    path: `/analyses/${analysisId}/summaries/${id}`,
    action: 'get',
  });
};

type Props = {
  ids: {
    analysisId?: string;
    summaryId?: string;
  }[];
  enabled?: boolean;
};

const useAnalysisSummaries = ({ ids, enabled }: Props) => {
  const queries = ids.map(({ analysisId, summaryId }) => ({
    queryKey: summariesKeys.item({ id: summaryId || '' }),
    queryFn: () =>
      fetchSummary({ analysisId: analysisId || '', id: summaryId || '' }),
    enabled: enabled && !!analysisId && !!summaryId,
    onSuccess: () => {},
  }));

  return useQueries<AnalysisSummaries>({
    queries,
  });
};

export default useAnalysisSummaries;
