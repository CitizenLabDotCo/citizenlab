import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import commonGroundProgressKeys from './keys/commonGroundProgressKeys';
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
    queryFn: () => fetchCommonGroundProgress({ phaseId }),
    enabled: !!phaseId,
  });
};

export default useCommonGroundProgress;
