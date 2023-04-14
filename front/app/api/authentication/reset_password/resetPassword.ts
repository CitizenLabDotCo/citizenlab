import fetcher from 'utils/cl-react-query/fetcher';
import { ResetPasswordProperties } from './types';

interface Parameters {
  password: string;
  token: string;
}

const triggerResetPassword = (requestBody: ResetPasswordProperties) => {
  return fetcher({
    path: `/users/reset_password`,
    body: requestBody,
    action: 'post',
  });
};

export default async function resetPassword({ password, token }: Parameters) {
  const bodyData = {
    user: {
      password,
      token,
    },
  };
  const response = await triggerResetPassword(bodyData);
  return response;
}
