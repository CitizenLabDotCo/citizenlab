import { Locale } from 'typings';
import signIn from './signIn';
import fetcher from 'utils/cl-react-query/fetcher';

interface Parameters {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  locale: Locale;
  isInvitation: boolean | null | undefined;
  token: string | undefined | null;
}

export default async function createAccountWithPassword({
  firstName,
  lastName,
  email,
  password,
  locale,
  isInvitation,
  token,
}: Parameters) {
  const innerBodyData = {
    email,
    password,
    locale,
    first_name: firstName,
    last_name: lastName,
  };

  // eslint-disable-next-line no-useless-catch
  try {
    const signUpEndpoint =
      isInvitation === true ? `invites/by_token/${token}/accept` : `users`;
    const bodyData = { [token ? 'invite' : 'user']: innerBodyData };
    await fetcher({
      path: `/${signUpEndpoint}`,
      body: bodyData,
      action: 'post',
    });
    const authenticatedUser = await signIn({ email, password });
    return authenticatedUser;
  } catch (error) {
    throw error;
  }
}
