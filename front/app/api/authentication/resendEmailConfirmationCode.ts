import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';

const resendCodeApiEndpoint = `${API_PATH}/user/resend_code`;

export default async function resendEmailConfirmationCode(newEmail?: string) {
  const bodyData = newEmail
    ? {
        new_email: newEmail,
      }
    : null;

  try {
    await streams.add(resendCodeApiEndpoint, bodyData);

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
