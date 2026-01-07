import meKeys from 'api/me/keys';

import fetcher from 'utils/cl-react-query/fetcher';
import { queryClient } from 'utils/cl-react-query/queryClient';

export const requestEmailConfirmationCodeUnauthenticated = async (
  email: string
) => {
  try {
    await fetcher({
      path: `/user/request_code_unauthenticated`,
      action: 'post',
      body: {
        request_code: { email },
      },
    });
    return true;
  } catch (errors) {
    throw errors.errors;
  }
};

export const requestEmailConfirmationCodeChangeEmail = async (
  new_email?: string
) => {
  try {
    await fetcher({
      path: `/user/request_code_email_change`,
      action: 'post',
      body: {
        request_code: { new_email },
      },
    });

    queryClient.invalidateQueries({ queryKey: meKeys.all() });
  } catch (errors) {
    throw errors.errors;
  }
};
