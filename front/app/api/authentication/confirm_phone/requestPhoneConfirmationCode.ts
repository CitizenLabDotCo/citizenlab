import fetcher from 'utils/cl-react-query/fetcher';

// `new_phone` may be omitted by an authenticated caller re-confirming their own
// existing phone (the backend falls back to current_user.phone). `ifNeeded` makes
// the send idempotent: only (re)sent when no code is currently outstanding.
export const requestCodeNewPhone = async (
  new_phone?: string,
  { ifNeeded = false }: { ifNeeded?: boolean } = {}
) => {
  await fetcher({
    path: `/user/request_code_new_phone`,
    action: 'post',
    body: {
      request_code: { new_phone, if_needed: ifNeeded },
    },
  });
};
