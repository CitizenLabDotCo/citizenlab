import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import areasKeys from './keys';
import { IRScore, RScoreKeys } from './types';

const fetchRScore = ({ id, projectId }: { id: string; projectId?: string }) =>
  fetcher<IRScore>({
    path: `/users/custom_fields/${id}/rscore`,
    action: 'get',
    queryParams: { project: projectId },
  });

const useRScore = ({ id, projectId }: { id: string; projectId?: string }) => {
  return useQuery<IRScore, CLErrors, IRScore, RScoreKeys>({
    queryKey: areasKeys.item({ id, projectId }),
    queryFn: () => fetchRScore({ id, projectId }),
  });
};

export default useRScore;
