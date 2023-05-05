import fetcher from 'utils/cl-react-query/fetcher';
import { TriggerResetPasswordProperties } from './types';
import tracks from './tracks';
import { trackEventByName } from 'utils/analytics';

const resetPasswordEmail = (requestBody: TriggerResetPasswordProperties) => {
  return fetcher({
    path: `/users/reset_password_email`,
    action: 'post',
    body: requestBody,
  });
};

export default async function sendPasswordResetMail(email: string) {
  // eslint-disable-next-line no-useless-catch
  try {
    const bodyData = {
      user: {
        email,
      },
    };
    const response = await resetPasswordEmail(bodyData);
    trackEventByName(tracks.resetPasswordEmailSentSuccess);
    return response;
  } catch (error) {
    trackEventByName(tracks.resetPasswordEmailSentFailed);
    throw error;
  }
}
