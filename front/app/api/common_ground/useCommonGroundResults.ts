import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import { USE_STUB_COMMON_GROUND } from './config';
import commonGroundResultsKeys from './keys/commonGroundResultsKeys';
import { sampleCommonGroundResults } from './stubs/results';
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
    queryFn: () =>
      USE_STUB_COMMON_GROUND
        ? Promise.resolve(sampleCommonGroundResults)
        : fetchCommonGroundResults({ phaseId }),
    enabled: !!phaseId,
  });
};

export default useCommonGroundResults;
