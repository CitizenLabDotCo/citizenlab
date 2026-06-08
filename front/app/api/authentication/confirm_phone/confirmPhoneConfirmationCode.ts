import requirementsKeys from 'api/authentication/authentication_requirements/keys';
import meKeys from 'api/me/keys';

import fetcher from 'utils/cl-react-query/fetcher';
import { queryClient } from 'utils/cl-react-query/queryClient';

export const confirmPhoneConfirmationCode = async (code: string) => {
  try {
    await fetcher({
      path: `/user/confirm_phone_code`,
      action: 'post',
      body: { phone_confirmation: { code } },
    });

    queryClient.invalidateQueries({ queryKey: meKeys.all() });
    queryClient.invalidateQueries({ queryKey: requirementsKeys.all() });

    return true;
  } catch (errors) {
    throw errors.errors;
  }
};
