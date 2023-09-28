import { UseQueryOptions, useQueries } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import avatarsKeys from './keys';
import { IAvatar } from './types';

type AvatarsWithIdsReturnType = UseQueryOptions<IAvatar>[];

export const fetchAvatar = (id: string) => {
  return fetcher<IAvatar>({
    path: `/avatars/${id}`,
    action: 'get',
  });
};

const useAvatarsWithIds = (avatarIds?: string[]) => {
  const queries = avatarIds
    ? avatarIds.map((avatarId) => ({
        queryKey: avatarsKeys.item({ id: avatarId }),
        queryFn: () => fetchAvatar(avatarId),
      }))
    : [];
  return useQueries<AvatarsWithIdsReturnType>({
    queries,
  });
};

export default useAvatarsWithIds;
