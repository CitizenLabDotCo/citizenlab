import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { IUsers } from 'api/users/types';

import fetcher from 'utils/cl-react-query/fetcher';

import spaceModeratorsKeys from './keys';
import { SpaceModeratorsKeys } from './types';

const fetchSpaceModerators = (spaceId: string) => {
  return fetcher<IUsers>({
    path: `/spaces/${spaceId}/moderators`,
    action: 'get',
    queryParams: {
      'page[size]': 1000,
      'page[number]': 1,
    },
  });
};

const useSpaceModerators = (spaceId: string) => {
  return useQuery<IUsers, CLErrors, IUsers, SpaceModeratorsKeys>({
    queryKey: spaceModeratorsKeys.list({ spaceId }),
    queryFn: () => fetchSpaceModerators(spaceId),
  });
};

export default useSpaceModerators;
