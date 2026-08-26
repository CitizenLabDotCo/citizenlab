import fetcher from 'utils/cl-react-query/fetcher';

// Sends a code to the `phone` of an account that isn't signed in yet (phone
// signup / passwordless login).
export const requestCodePhone = async (phone: string) => {
  await fetcher({
    path: `/user/request_code_phone`,
    action: 'post',
    body: {
      request_code: { phone },
    },
  });
};

// Sends a re-confirmation code to the signed-in user's own number.
// `onlyIfFirstTime` makes the send idempotent: the backend only (re)sends when
// no code is currently outstanding (the first send of the confirmation cycle).
export const requestReconfirmCodePhone = async ({
  onlyIfFirstTime = false,
}: { onlyIfFirstTime?: boolean } = {}) => {
  await fetcher({
    path: `/user/request_reconfirm_code_phone`,
    action: 'post',
    body: {
      request_code: { only_if_first_time: onlyIfFirstTime },
    },
  });
};

export const requestCodeNewPhone = async (newPhone: string) => {
  await fetcher({
    path: `/user/request_code_new_phone`,
    action: 'post',
    body: {
      request_code: {
        new_phone: newPhone,
      },
    },
  });
};
