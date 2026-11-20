import { useMutation, useQueryClient } from '@tanstack/react-query';

import { logoutUrlFrom } from 'api/authentication/sign_in_out/signOut';
import groupsKeys from 'api/groups/keys';
import useAuthUser from 'api/me/useAuthUser';
import invalidateSeatsCache from 'api/seats/invalidateSeatsCache';
import userCountKeys from 'api/users_count/keys';

import { API_PATH } from 'containers/App/constants';

import { HttpError } from 'utils/cl-react-query/fetcher';
import { invalidateQueryCache } from 'utils/cl-react-query/resetQueryCache';
import clHistory from 'utils/cl-router/history';

import usersKeys from './keys';

/*
  Deletes the user's own account. The API signs them out too, and returns the URL to
  sign out at their SSO provider when it supports that. `fetcher` would drop that
  response body, so this calls the API directly.
*/
const deleteSelf = async (
  userId: string | undefined
): Promise<string | null> => {
  if (!userId) throw new Error('No signed-in user to delete');

  const response = await fetch(`${API_PATH}/users/${userId}`, {
    method: 'DELETE',
    credentials: 'include', // Include cookies (session, auth tokens)
  });
  if (!response.ok) {
    throw new HttpError('Deleting the account failed', response.status);
  }

  return logoutUrlFrom(response);
};

const useDeleteSelf = () => {
  const queryClient = useQueryClient();
  const { data: authUser } = useAuthUser();

  return useMutation({
    mutationFn: () => deleteSelf(authUser?.data.id),
    onSuccess: (logoutUrl) => {
      // Sign out at the SSO provider too. It sends the user back to the platform.
      if (logoutUrl) {
        window.location.href = logoutUrl;
        return;
      }

      invalidateQueryCache();
      clHistory.push('/', { scrollToTop: true });
      queryClient.invalidateQueries({
        queryKey: userCountKeys.items(),
      });

      invalidateSeatsCache();

      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({ queryKey: groupsKeys.all() });
    },
  });
};

export default useDeleteSelf;
