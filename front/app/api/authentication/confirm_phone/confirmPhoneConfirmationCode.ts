import requirementsKeys from 'api/authentication/authentication_requirements/keys';
import { ConfirmCodeResponse } from 'api/authentication/confirm_email/confirmEmailConfirmationCode';
import meKeys from 'api/me/keys';

import { setJwt } from 'utils/auth/jwt';
import fetcher from 'utils/cl-react-query/fetcher';
import { queryClient } from 'utils/cl-react-query/queryClient';
import { invalidateQueryCache } from 'utils/cl-react-query/resetQueryCache';

// `phone` is only passed by unauthenticated callers (phone signup / passwordless
// phone login), and that is also the only case where we adopt the token the
// backend returns: an authenticated user re-confirming their own number keeps
// the (possibly longer lived) token they already have.
export const confirmCodePhone = async (
  code: string,
  phone?: string,
  sms_manual_campaign_consent?: boolean
) => {
  try {
    const res = await fetcher<ConfirmCodeResponse>({
      path: `/user/confirm_code_phone`,
      action: 'post',
      body: {
        confirmation: { phone, code, sms_manual_campaign_consent },
      },
    });

    if (phone) {
      setJwt(res.data.attributes.auth_token.token, false);
      invalidateQueryCache();
    } else {
      queryClient.invalidateQueries({ queryKey: meKeys.all() });
      queryClient.invalidateQueries({ queryKey: requirementsKeys.all() });
    }

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
