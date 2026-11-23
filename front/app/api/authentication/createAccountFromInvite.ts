import { SupportedLocale } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import signIn from './sign_in_out/signIn';

export interface Parameters {
  firstName: string;
  lastName: string;
  email: string;
  // Left out for an invitation code: the invitee sets it once their email is confirmed.
  password?: string;
  locale: SupportedLocale;
  token: string;
}

interface AcceptInviteBody {
  invite: {
    email: string;
    password?: string;
    locale: SupportedLocale;
    first_name: string;
    last_name: string;
  };
}

const triggerCreateAccountFromInvite = (
  token: string,
  requestBody: AcceptInviteBody
) => {
  return fetcher({
    path: `/invites/by_token/${token}/accept`,
    body: requestBody,
    action: 'post',
  });
};

export const acceptInvite = async ({
  firstName,
  lastName,
  email,
  password,
  locale,
  token,
}: Parameters) => {
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
};

export default async function createAccountFromInvite(
  params: Parameters & { password: string }
) {
  await acceptInvite(params);

  const { email, password } = params;
  const authenticatedUser = await signIn({ email, password });

  return authenticatedUser;
}
