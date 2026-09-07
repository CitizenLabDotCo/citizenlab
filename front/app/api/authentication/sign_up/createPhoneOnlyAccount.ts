import { SupportedLocale } from 'typings';

import {
  RESEND_INTERVAL_SECONDS,
  setResendCooldown,
} from 'api/authentication/confirm_phone/resendCooldown';
import { IUser } from 'api/users/types';

import fetcher from 'utils/cl-react-query/fetcher';
import { clearClaimToken } from 'utils/claimToken';

import { CreatePhoneOnlyAccountProperties } from './types';

const triggerCreatePhoneOnlyAccount = (
  requestBody: CreatePhoneOnlyAccountProperties
) => {
  return fetcher<IUser>({
    path: `/users/create_phone`,
    action: 'post',
    body: requestBody,
  });
};

export interface Parameters {
  phone: string;
  locale: SupportedLocale;
  claimTokens?: string[];
}

export default async function createPhoneOnlyAccount({
  phone,
  locale,
  claimTokens,
}: Parameters) {
  await triggerCreatePhoneOnlyAccount({
    user: {
      phone,
      locale,
      claim_tokens: claimTokens,
    },
  });

  // Creating the account always sends a code, so the confirmation step this
  // leads to starts on a full cooldown.
  setResendCooldown(RESEND_INTERVAL_SECONDS);

  clearClaimToken();
}
