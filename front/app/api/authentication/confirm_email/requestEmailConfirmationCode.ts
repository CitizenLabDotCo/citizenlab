import requirementsKeys from 'api/authentication/authentication_requirements/keys';
import meKeys from 'api/me/keys';

import fetcher from 'utils/cl-react-query/fetcher';
import { queryClient } from 'utils/cl-react-query/queryClient';

export const requestEmailConfirmationCodeUnauthenticated = async (
  email: string
) => {
  await fetcher({
    path: `/user/request_code_unauthenticated`,
    action: 'post',
    body: {
      request_code: { email },
    },
  });

  return true;
};

export const requestEmailConfirmationCodeChangeEmail = async (
  new_email?: string
) => {
  await fetcher({
    path: `/user/request_code_email_change`,
    action: 'post',
    body: {
      request_code: { new_email },
    },
  });
};
