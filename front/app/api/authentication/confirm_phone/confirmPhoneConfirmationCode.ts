import requirementsKeys from 'api/authentication/authentication_requirements/keys';
import meKeys from 'api/me/keys';

import fetcher from 'utils/cl-react-query/fetcher';
import { queryClient } from 'utils/cl-react-query/queryClient';
import { invalidateQueryCache } from 'utils/cl-react-query/resetQueryCache';

// Confirms the `phone` of an account that isn't signed in yet (phone signup /
// passwordless phone login). On success, the API signs the user in by setting
// the auth cookie.
export const confirmCodePhone = async (
  code: string,
  phone: string,
  sms_manual_campaign_consent?: boolean
) => {
  try {
    await fetcher({
      path: `/user/confirm_code_phone`,
      action: 'post',
      body: {
        confirmation: { phone, code, sms_manual_campaign_consent },
      },
    });

    invalidateQueryCache();

    return true;
  } catch (errors) {
    throw errors.errors;
  }
};

// Re-confirmation of the signed-in user's own number. The caller stays signed in
// with the (possibly longer lived) auth cookie it already has.
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
