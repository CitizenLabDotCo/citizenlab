import fetcher from 'utils/cl-react-query/fetcher';
import { TriggerResetPasswordProperties } from './types';

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
    return response;
  } catch (error) {
    throw error;
  }
}
