import fetcher from 'utils/cl-react-query/fetcher';

// `email` may be omitted by an authenticated caller re-confirming their own
// email (the backend falls back to current_user). `ifNeeded` makes the send
// idempotent: the backend only (re)sends when no code is currently outstanding.
export const requestCodeEmail = async (
  email?: string,
  { ifNeeded = false }: { ifNeeded?: boolean } = {}
) => {
  await fetcher({
    path: `/user/request_code_email`,
    action: 'post',
    body: {
      request_code: { email, if_needed: ifNeeded },
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
