import fetcher from 'utils/cl-react-query/fetcher';

// `phone` may be omitted by an authenticated caller re-confirming their own
// number (the backend falls back to current_user). `onlyIfFirstTime` makes the
// send idempotent: the backend only (re)sends when no code is currently
// outstanding (the first send of the confirmation cycle).
export const requestCodePhone = async ({
  phone,
  onlyIfFirstTime = false,
}: { phone?: string; onlyIfFirstTime?: boolean } = {}) => {
  await fetcher({
    path: `/user/request_code_phone`,
    action: 'post',
    body: {
      request_code: {
        phone,
        only_if_first_time: onlyIfFirstTime,
      },
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
