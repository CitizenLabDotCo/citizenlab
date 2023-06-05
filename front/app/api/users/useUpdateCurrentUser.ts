import { useMutation } from '@tanstack/react-query';
import { CLErrorsJSON } from 'typings';
import { IUser, IUserUpdate } from './types';
import streams from 'utils/streams';
import { API_PATH } from 'containers/App/constants';
import { updateUser, invalidateUpdateUserCache } from './useUpdateUser';
import useAuthUser from 'hooks/useAuthUser';
import { isNilOrError } from 'utils/helperUtils';

const useUpdateCurrentUser = () => {
  const authUser = useAuthUser();

  const updateCurrentUser = async ({ ...requestBody }: IUserUpdate) => {
    // if (isNilOrError(authUser)) {
    //   return undefined;
    // }
    return updateUser({
      ...requestBody,
      userId: isNilOrError(authUser) ? '' : authUser.id,
    });
  };

  return useMutation<IUser, CLErrorsJSON, IUserUpdate>({
    mutationFn: updateCurrentUser,
    onSuccess: async (_data, variables) => {
      await streams.fetchAllWith({
        apiEndpoint: [`${API_PATH}/users/me`],
      });

      invalidateUpdateUserCache(variables);
    },
  });
};

export default useUpdateCurrentUser;
