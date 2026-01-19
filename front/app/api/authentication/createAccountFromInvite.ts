import { SupportedLocale } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import signIn from './sign_in_out/signIn';
import { CreateAccountWithPasswordProperties } from './sign_up/types';

export interface Parameters {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  locale: SupportedLocale;
  token: string;
}

const triggerCreateAccountFromInvite = (
  token: string,
  requestBody: CreateAccountWithPasswordProperties
) => {
  return fetcher({
    path: `/invites/by_token/${token}/accept`,
    body: requestBody,
    action: 'post',
  });
};

export default async function createAccountFromInvite({
  firstName,
  lastName,
  email,
  password,
  locale,
  token,
}: Parameters) {
  const bodyData = {
    invite: {
      email,
      password,
      locale,
      first_name: firstName,
      last_name: lastName,
    },
  };
  await triggerCreateAccountFromInvite(token, bodyData);

  const authenticatedUser = await signIn({ email, password });

  return authenticatedUser;
}
