import { SupportedLocale } from 'typings';

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

  clearClaimToken();
}
