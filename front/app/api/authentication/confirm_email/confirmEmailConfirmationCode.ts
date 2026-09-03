import requirementsKeys from 'api/authentication/authentication_requirements/keys';
import meKeys from 'api/me/keys';
import { HighestRole } from 'api/users/types';

import { setJwt } from 'utils/auth/jwt';
import fetcher from 'utils/cl-react-query/fetcher';
import { queryClient } from 'utils/cl-react-query/queryClient';
import { invalidateQueryCache } from 'utils/cl-react-query/resetQueryCache';

// Returned by both confirm_code_email and confirm_code_phone.
export type ConfirmCodeResponse = {
  data: {
    type: 'create';
    attributes: {
      auth_token: {
        payload: {
          exp: number;
          cluster: string;
          highest_role: HighestRole;
          sub: string;
          tenant: string;
        };
        token: string;
      };
    };
  };
};

export const confirmCodeEmail = async (email: string, code: string) => {
  try {
    const res = await fetcher<ConfirmCodeResponse>({
      path: `/user/confirm_code_email`,
      action: 'post',
      body: {
        confirmation: { email, code },
      },
    });

    setJwt(res.data.attributes.auth_token.token, false);
    invalidateQueryCache();

    return true;
  } catch (errors) {
    throw errors.errors;
  }
};

// Re-confirmation of the signed-in user's own email. The caller keeps the token
// it already has, so - unlike confirmCodeEmail - no JWT is set here.
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

// Consumes a merge-account code. On success the account that made the request no
// longer exists - it has been merged into the account owning the confirmed address -
// so the response carries a token for that surviving account. The whole cache is
// reset rather than a few keys: the signed-in user is now a different person.
export const confirmCodeMergeAccount = async (code: string) => {
  try {
    const res = await fetcher<ConfirmCodeResponse>({
      path: `/user/confirm_code_merge_account`,
      action: 'post',
      body: {
        confirmation: { code },
      },
    });

    setJwt(res.data.attributes.auth_token.token, false);
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
