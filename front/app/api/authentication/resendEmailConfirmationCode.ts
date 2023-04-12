import { API_PATH } from 'containers/App/constants';
import fetcher from 'utils/cl-react-query/fetcher';
import streams from 'utils/streams';

export default async function resendEmailConfirmationCode(newEmail?: string) {
  const bodyData = newEmail
    ? {
        new_email: newEmail,
      }
    : null;

  try {
    await fetcher({
      path: `/user/resend_code`,
      body: bodyData,
      action: 'post',
    });

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
