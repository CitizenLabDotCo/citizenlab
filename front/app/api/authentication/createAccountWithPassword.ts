import { IHttpMethod, Locale } from 'typings';
import signIn from './signIn';
import request from 'utils/request';
import { API_PATH } from 'containers/App/constants';

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

  const httpMethod: IHttpMethod = {
    method: 'POST',
  };

  // eslint-disable-next-line no-useless-catch
  try {
    const signUpEndpoint =
      isInvitation === true
        ? `${API_PATH}/invites/by_token/${token}/accept`
        : `${API_PATH}/users`;
    const bodyData = { [token ? 'invite' : 'user']: innerBodyData };
    await request(signUpEndpoint, bodyData, httpMethod, null);
    const authenticatedUser = await signIn({ email, password });
    return authenticatedUser;
  } catch (error) {
    throw error;
  }
}
