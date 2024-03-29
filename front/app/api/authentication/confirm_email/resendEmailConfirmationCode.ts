import meKeys from 'api/me/keys';

import fetcher from 'utils/cl-react-query/fetcher';
import { queryClient } from 'utils/cl-react-query/queryClient';

import { ResendEmailCodeProperties } from './types';

const resendEmailCode = (requestBody: ResendEmailCodeProperties) => {
  return fetcher({
    path: `/user/resend_code`,
    body: requestBody,
    action: 'post',
  });
};

export default async function resendEmailConfirmationCode(newEmail?: string) {
  const bodyData = newEmail
    ? {
        new_email: newEmail,
      }
    : null;

  try {
    await resendEmailCode(bodyData);

    if (bodyData?.new_email) {
      queryClient.invalidateQueries({ queryKey: meKeys.all() });
    }

    return true;
  } catch (errors) {
    throw errors.errors;
  }
}
