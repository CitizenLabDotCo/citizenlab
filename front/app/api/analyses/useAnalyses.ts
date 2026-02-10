import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import analysesKeys from './keys';
import { IAnalyses, AnalysesKeys, IAnalysesQueryParams } from './types';

const fetchAnalyses = ({
  projectId,
  phaseId,
  pageSize,
  pageNumber,
}: IAnalysesQueryParams) => {
  return fetcher<IAnalyses>({
    path: `/analyses`,
    action: 'get',
    queryParams: {
      'page[number]': pageNumber || 1,
      'page[size]': pageSize || 5000,
      project_id: projectId,
      phase_id: phaseId,
    },
  });
};

const useAnalyses = (params: IAnalysesQueryParams) => {
  return useQuery<IAnalyses, CLErrors, IAnalyses, AnalysesKeys>({
    queryKey: analysesKeys.list(params),
    queryFn: () => fetchAnalyses(params),
    // If there is no projectId or phaseId, don't fetch analyses
    enabled: !!params.projectId || !!params.phaseId,
  });
};

export default useAnalyses;
