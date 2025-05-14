import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import { USE_STUB_COMMON_GROUND } from './config';
import commonGroundProgressKeys from './keys/commonGroundProgressKeys';
import { fetchCommonGroundProgressStub } from './stubs/progress';
import { CommonGroundProgressKeys, ICommonGroundProgress } from './types';

export const fetchCommonGroundProgress = ({
  phaseId,
}: {
  phaseId?: string | null;
}): Promise<ICommonGroundProgress> =>
  fetcher<ICommonGroundProgress>({
    path: `/phases/${phaseId}/progress`,
    action: 'get',
  });

const useCommonGroundProgress = (phaseId: string | undefined) => {
  return useQuery<
    ICommonGroundProgress,
    CLErrors,
    ICommonGroundProgress,
    CommonGroundProgressKeys
  >({
    queryKey: commonGroundProgressKeys.list({ phaseId }),
    queryFn: () =>
      USE_STUB_COMMON_GROUND
        ? fetchCommonGroundProgressStub(phaseId)
        : fetchCommonGroundProgress({ phaseId }),
    enabled: !!phaseId,
  });
};

export default useCommonGroundProgress;
