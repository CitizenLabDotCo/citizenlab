import fetcher from 'utils/cl-react-query/fetcher';

// Sends a code to the `email` of an account that isn't signed in yet (email
// signup / passwordless login).
export const requestCodeEmail = async (email: string) => {
  await fetcher({
    path: `/user/request_code_email`,
    action: 'post',
    body: {
      request_code: { email },
    },
  });

  return true;
};

// Sends a re-confirmation code to the signed-in user's own email.
// `onlyIfFirstTime` makes the send idempotent: the backend only (re)sends when
// no code is currently outstanding (the first send of the confirmation cycle).
export const requestReconfirmCodeEmail = async ({
  onlyIfFirstTime = false,
}: { onlyIfFirstTime?: boolean } = {}) => {
  await fetcher({
    path: `/user/request_reconfirm_code_email`,
    action: 'post',
    body: {
      request_code: { only_if_first_time: onlyIfFirstTime },
    },
  });

  return true;
};

export const requestCodeNewEmail = async (new_email?: string) => {
  await fetcher({
    path: `/user/request_code_new_email`,
    action: 'post',
    body: {
      request_code: { new_email },
    },
  });
};
