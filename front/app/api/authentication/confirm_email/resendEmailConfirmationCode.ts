import { API_PATH } from 'containers/App/constants';
import fetcher from 'utils/cl-react-query/fetcher';
import streams from 'utils/streams';
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
      await streams.fetchAllWith({
        apiEndpoint: [`${API_PATH}/users/me`],
      });
    }

    return true;
  } catch (errors) {
    throw errors.json.errors;
  }
}
