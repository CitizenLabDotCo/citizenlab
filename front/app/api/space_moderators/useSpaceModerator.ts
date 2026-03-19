import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { IUser, IUsers } from 'api/users/types';

import fetcher from 'utils/cl-react-query/fetcher';

import spaceModeratorsKeys from './keys';
import { SpaceModeratorsKeys } from './types';

interface Params {
  spaceId: string;
  userId: string;
}

const fetchSpaceModerator = ({ spaceId, userId }: Params) => {
  return fetcher<IUser>({
    path: `/spaces/${spaceId}/moderators/${userId}`,
    action: 'get',
  });
};

const useSpaceModerator = (params: Params) => {
  return useQuery<IUser, CLErrors, IUsers, SpaceModeratorsKeys>({
    queryKey: spaceModeratorsKeys.list(params),
    queryFn: () => fetchSpaceModerator(params),
  });
};

export default useSpaceModerator;
