import { IUserUpdate } from './types';
import { updateUser } from './useUpdateUser';
import streams from 'utils/streams';
import { API_PATH } from 'containers/App/constants';
import { queryClient } from 'utils/cl-react-query/queryClient';
import invalidateSeatsCache from 'api/seats/invalidateSeatsCache';
import usersKeys from './keys';
import groupsKeys from 'api/groups/keys';

const updateUserWithCacheInvalidation = async ({
  userId,
  ...requestBody
}: IUserUpdate) => {
  const user = await updateUser({ userId, ...requestBody });

  await streams.fetchAllWith({
    apiEndpoint: [`${API_PATH}/users/me`],
  });

  // Invalidate seats if the user's roles have changed
  if (requestBody.roles) {
    invalidateSeatsCache();
  }

  queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
  queryClient.invalidateQueries({ queryKey: groupsKeys.all() });

  return user;
};

export default updateUserWithCacheInvalidation;
