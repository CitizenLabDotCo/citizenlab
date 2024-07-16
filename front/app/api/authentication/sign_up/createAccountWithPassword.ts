import { SupportedLocale } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import signIn from '../sign_in_out/signIn';

import { CreateAccountWithPasswordProperties } from './types';

export interface Parameters {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  locale: SupportedLocale;
  isInvitation?: boolean | null | undefined;
  token?: string | undefined | null;
}

const triggerCreateAccountWithPassword = (
  endpoint: string,
  requestBody: CreateAccountWithPasswordProperties
) => {
  return fetcher({
    path: `/${endpoint}`,
    body: requestBody,
    action: 'post',
  });
};

export default async function createAccountWithPassword({
  firstName,
  lastName,
  email,
  password,
  locale,
  isInvitation,
  token,
}: Parameters) {
  const signUpEndpoint =
    isInvitation === true ? `invites/by_token/${token}/accept` : `users`;
  const bodyData = {
    [token ? 'invite' : 'user']: {
      email,
      password,
      locale,
      first_name: firstName,
      last_name: lastName,
    },
  };
  await triggerCreateAccountWithPassword(signUpEndpoint, bodyData);

  const authenticatedUser = await signIn({ email, password });

  return authenticatedUser;
}
