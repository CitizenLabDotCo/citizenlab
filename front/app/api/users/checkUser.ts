import { setResendCooldown } from 'api/authentication/confirm_phone/resendCooldown';

import fetcher from 'utils/cl-react-query/fetcher';

import { UserCheckResponse } from './types';

export const checkEmail = (email: string) => {
  return fetcher<UserCheckResponse>({
    path: '/users/check_email',
    action: 'post',
    body: { user: { email } },
  });
};

// Checking a number is one of the paths that sends a confirmation code (see
// auto_send_code? in the users controller), so the response says how long the
// confirmation step has to wait before offering a new one.
export const checkPhone = async (phone: string) => {
  const response = await fetcher<UserCheckResponse>({
    path: '/users/check_phone',
    action: 'post',
    body: { user: { phone } },
  });

  const { code_retry_after } = response.data.attributes;
  if (code_retry_after !== undefined) {
    setResendCooldown(code_retry_after);
  }

  return response;
};
