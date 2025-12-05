import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import userParticipationStatsKeys from './keys';
import {
  UserParticipationStatsKeys,
  IParameters,
  IParticipationStats,
} from './types';

const fetchUserParticipationStats = ({ userId }: IParameters) =>
  fetcher<IParticipationStats>({
    path: `/users/${userId}/participation_stats`,
    action: 'get',
  });

interface UseUserParticipationStatsParams extends IParameters {
  enabled?: boolean;
}

const useUserParticipationStats = ({
  userId,
  enabled = true,
}: UseUserParticipationStatsParams) => {
  return useQuery<
    IParticipationStats,
    CLErrors,
    IParticipationStats,
    UserParticipationStatsKeys
  >({
    queryKey: userParticipationStatsKeys.item({ userId }),
    queryFn: () => fetchUserParticipationStats({ userId }),
    staleTime: 0,
    enabled,
  });
};

export default useUserParticipationStats;
