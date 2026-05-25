import fetcher from 'utils/cl-react-query/fetcher';

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
