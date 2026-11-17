import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { IUser } from 'api/users/types';

import fetcher from 'utils/cl-react-query/fetcher';
import { isPhasePreviewFrame } from 'utils/phasePreview/runtime';

import meKeys from './keys';
import { MeKeys } from './types';

// The API authenticates the request with the HttpOnly auth cookie, which this code
// can't read. Without a valid one, there is no signed-in user and we get null.
export const fetchMe = async () => {
  const data = await fetcher<IUser | null>({
    path: `/users/me`,
    action: 'get',
  });

  if (!data) return null;

  if (isPhasePreviewFrame()) {
    return {
      ...data,
      data: {
        ...data.data,
        attributes: {
          ...data.data.attributes,
          roles: [],
          highest_role: 'user' as const,
        },
      },
    };
  }

  return data;
};

const useAuthUser = () => {
  return useQuery<IUser | null, CLErrors, IUser | null, MeKeys>({
    queryKey: meKeys.all(),
    queryFn: () => fetchMe(),
  });
};

export default useAuthUser;
