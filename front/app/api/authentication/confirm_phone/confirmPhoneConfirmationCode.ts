import requirementsKeys from 'api/authentication/authentication_requirements/keys';
import meKeys from 'api/me/keys';

import fetcher from 'utils/cl-react-query/fetcher';
import { queryClient } from 'utils/cl-react-query/queryClient';

export const confirmCodePhone = (code: string) => {
  return confirmCode('confirm_code_phone', code);
};

export const confirmCodeNewPhone = async (
  code: string,
  sms_manual_campaign_consent?: boolean
) => {
  return confirmCode(
    'confirm_code_new_phone',
    code,
    sms_manual_campaign_consent
  );
};

export const confirmCode = async (
  endpoint: string,
  code: string,
  sms_manual_campaign_consent?: boolean
) => {
  try {
    await fetcher({
      path: `/user/${endpoint}`,
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
