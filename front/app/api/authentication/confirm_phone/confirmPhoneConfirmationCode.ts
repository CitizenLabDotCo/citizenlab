import requirementsKeys from 'api/authentication/authentication_requirements/keys';
import { ConfirmCodeResponse } from 'api/authentication/confirm_email/confirmEmailConfirmationCode';
import meKeys from 'api/me/keys';

import { setJwt } from 'utils/auth/jwt';
import fetcher from 'utils/cl-react-query/fetcher';
import { queryClient } from 'utils/cl-react-query/queryClient';
import { invalidateQueryCache } from 'utils/cl-react-query/resetQueryCache';

// Confirms the `phone` of an account that isn't signed in yet (phone signup /
// passwordless phone login), which is why the token the backend returns is
// adopted here.
export const confirmCodePhone = async (code: string, phone: string) => {
  try {
    const res = await fetcher<ConfirmCodeResponse>({
      path: `/user/confirm_code_phone`,
      action: 'post',
      body: {
        confirmation: { phone, code },
      },
    });

    setJwt(res.data.attributes.auth_token.token, false);
    invalidateQueryCache();

    return true;
  } catch (errors) {
    throw errors.errors;
  }
};

// Re-confirmation of the signed-in user's own number. The caller keeps the
// (possibly longer lived) token it already has, so no JWT is set here.
export const reconfirmCodePhone = async (code: string) => {
  try {
    await fetcher({
      path: `/user/reconfirm_code_phone`,
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

export const confirmCodeNewPhone = async (
  code: string,
  sms_manual_campaign_consent?: boolean
) => {
  try {
    await fetcher({
      path: `/user/confirm_code_new_phone`,
      action: 'post',
      body: {
        confirmation: { code, sms_manual_campaign_consent },
      },
    });

    queryClient.invalidateQueries({ queryKey: meKeys.all() });
    queryClient.invalidateQueries({ queryKey: requirementsKeys.all() });

    return true;
  } catch (errors) {
    throw errors.errors;
  }
};
