import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import commonGroundResultsKeys from './keys/commonGroundResultsKeys';
import { ICommonGroundResults, CommonGroundResultsKeys } from './types';

export const fetchCommonGroundResults = ({
  phaseId,
}: {
  phaseId?: string | null;
}): Promise<ICommonGroundResults> =>
  fetcher<ICommonGroundResults>({
    path: `/phases/${phaseId}/common_ground_results`,
    action: 'get',
  });

const useCommonGroundResults = (phaseId: string | undefined) => {
  return useQuery<
    ICommonGroundResults,
    CLErrors,
    ICommonGroundResults,
    CommonGroundResultsKeys
  >({
    queryKey: commonGroundResultsKeys.list({ phaseId }),
    queryFn: () => fetchCommonGroundResults({ phaseId }),
    enabled: !!phaseId,
  });
};

export default useCommonGroundResults;
