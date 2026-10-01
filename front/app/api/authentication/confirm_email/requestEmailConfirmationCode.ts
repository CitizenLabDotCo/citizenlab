import fetcher from 'utils/cl-react-query/fetcher';
import { isCLErrorsWrapper, isUnauthorizedRQ } from 'utils/errorUtils';

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

// Sends a code to the address of the account an email-less SSO user wants to be
// merged into. Without an address the backend resends to the pending one.
export const requestCodeMergeAccount = async (merge_target_email?: string) => {
  await fetcher({
    path: `/user/request_code_merge_account`,
    action: 'post',
    body: {
      request_code: { merge_target_email },
    },
  });
};

const isEmailTaken = (error: unknown) =>
  isCLErrorsWrapper(error) &&
  Array.isArray(error.errors.new_email) &&
  error.errors.new_email.some(({ error }) => error === 'is already taken');

// Starts a code for an address the signed-in user wants as their email. When another
// account owns it, that is usually the same person's older account, so a merge into
// it is tried instead. The backend decides who may merge; anyone it refuses just
// sees the address as taken.
export const requestCodeForEmail = async (
  email: string
): Promise<'new_email' | 'merge_account'> => {
  try {
    await requestCodeNewEmail(email);
    return 'new_email';
  } catch (newEmailError) {
    if (!isEmailTaken(newEmailError)) throw newEmailError;

    try {
      await requestCodeMergeAccount(email);
      return 'merge_account';
    } catch (mergeError) {
      throw isUnauthorizedRQ(mergeError) ? newEmailError : mergeError;
    }
  }
};
