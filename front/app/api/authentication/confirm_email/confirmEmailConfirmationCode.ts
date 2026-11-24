import requirementsKeys from 'api/authentication/authentication_requirements/keys';
import meKeys from 'api/me/keys';

import fetcher from 'utils/cl-react-query/fetcher';
import { queryClient } from 'utils/cl-react-query/queryClient';
import { invalidateQueryCache } from 'utils/cl-react-query/resetQueryCache';

export const confirmCodeEmail = async (email: string, code: string) => {
  try {
    // On success, the API signs the user in by setting the auth cookie.
    await fetcher({
      path: `/user/confirm_code_email`,
      action: 'post',
      body: {
        confirmation: { email, code },
      },
    });

    invalidateQueryCache();

    return true;
  } catch (errors) {
    throw errors.errors;
  }
};

// Re-confirmation of the signed-in user's own email. The caller stays signed in
// with the auth cookie it already has, which - unlike confirmCodeEmail - is left alone.
export const reconfirmCodeEmail = async (code: string) => {
  try {
    await fetcher({
      path: `/user/reconfirm_code_email`,
      action: 'post',
      body: {
        confirmation: { code },
      },
    });

    queryClient.invalidateQueries({ queryKey: meKeys.all() });
    queryClient.invalidateQueries({ queryKey: requirementsKeys.all() });

    return true;
  } catch (errors) {
    throw errors.errors;
  }
};

// On success the requesting account no longer exists, so the API signs the user
// in as the survivor. The whole cache is reset rather than a few keys: the
// signed-in user is now a different person.
export const confirmCodeMergeAccount = async (code: string) => {
  try {
    await fetcher({
      path: `/user/confirm_code_merge_account`,
      action: 'post',
      body: {
        confirmation: { code },
      },
    });

    invalidateQueryCache();

    return true;
  } catch (errors) {
    throw errors.errors;
  }
};

export const confirmCodeNewEmail = async (code: string) => {
  try {
    await fetcher({
      path: `/user/confirm_code_new_email`,
      action: 'post',
      body: {
        confirmation: { code },
      },
    });

    queryClient.invalidateQueries({ queryKey: meKeys.all() });
    queryClient.invalidateQueries({ queryKey: requirementsKeys.all() });

    return true;
  } catch (errors) {
    throw errors.errors;
  }
};
