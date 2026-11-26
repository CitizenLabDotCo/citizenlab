import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrorsWrapper } from 'typings';

import { TAppConfigurationSetting } from 'api/app_configuration/types';
import { IUser } from 'api/users/types';

import fetcher from 'utils/cl-react-query/fetcher';

import meKeys from './keys';

// "Not now" to the invitation to try an early access feature. The back end
// decides when to invite the user again.
const declineEarlyAccess = (feature: TAppConfigurationSetting) =>
  fetcher<IUser>({
    path: '/users/me/early_access_declines',
    action: 'post',
    body: { feature },
  });

const useDeclineEarlyAccess = () => {
  const queryClient = useQueryClient();

  return useMutation<IUser, CLErrorsWrapper, TAppConfigurationSetting>({
    mutationFn: declineEarlyAccess,
    onSuccess: (user) => {
      queryClient.setQueryData(meKeys.all(), user);
    },
  });
};

export default useDeclineEarlyAccess;
