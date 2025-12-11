import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import userParticipationStatsKeys from './keys';
import {
  UserParticipationStatsKeys,
  IParameters,
  IParticipationStats,
} from './types';

const fetchUserParticipationStats = ({ id }: IParameters) =>
  fetcher<IParticipationStats>({
    path: `/users/${id}/participation_stats`,
    action: 'get',
  });

interface UseUserParticipationStatsParams extends IParameters {
  enabled?: boolean;
}

const useUserParticipationStats = ({
  id,
  enabled = true,
}: UseUserParticipationStatsParams) => {
  return useQuery<
    IParticipationStats,
    CLErrors,
    IParticipationStats,
    UserParticipationStatsKeys
  >({
    queryKey: userParticipationStatsKeys.item({ id }),
    queryFn: () => fetchUserParticipationStats({ id }),
    staleTime: 0,
    enabled,
  });
};

export default useUserParticipationStats;
