import fetcher from 'utils/cl-react-query/fetcher';

// `newPhone` may be omitted by an authenticated caller re-confirming their own
// existing phone (the backend falls back to current_user.phone). `onlyIfFirstTime`
// makes the send idempotent: only (re)sent when no code is currently outstanding.
export const requestCodeNewPhone = async ({
  newPhone,
  onlyIfFirstTime = false,
}: { newPhone?: string; onlyIfFirstTime?: boolean } = {}) => {
  await fetcher({
    path: `/user/request_code_new_phone`,
    action: 'post',
    body: {
      request_code: {
        new_phone: newPhone,
        only_if_first_time: onlyIfFirstTime,
      },
    },
  });
};
