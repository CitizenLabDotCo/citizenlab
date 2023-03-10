import { IUser } from 'services/users';
import { IHttpMethod } from 'typings';
import { API_PATH } from 'containers/App/constants';
import { setJwt } from 'utils/auth/jwt';
import request from 'utils/request';
import streams from 'utils/streams';
import { resetQueryCache } from 'utils/cl-react-query/resetQueryCache';

interface Parameters {
  email: string;
  password?: string;
  rememberMe?: boolean;
  tokenLifetime?: number;
}

interface IUserToken {
  jwt: string;
}

const userTokenPath = `${API_PATH}/user_token`;
const authUserPath = `${API_PATH}/users/me`;

export default async function signIn({
  email,
  password = '',
  rememberMe = false,
  tokenLifetime,
}: Parameters) {
  try {
    const bodyData = { auth: { email, password, remember_me: rememberMe } };
    const httpMethod: IHttpMethod = { method: 'POST' };

    const { jwt } = await request<IUserToken>(
      userTokenPath,
      bodyData,
      httpMethod,
      null
    );

    setJwt(jwt, rememberMe, tokenLifetime);

    const authUser = await getAuthUserAsync();

    await streams.reset();
    await resetQueryCache();

    return authUser;
  } catch (error) {
    signOut();
    throw error;
  }
}

async function getAuthUserAsync() {
  try {
    const authenticatedUser = await request<IUser>(
      authUserPath,
      null,
      null,
      null
    );
    return authenticatedUser;
  } catch {
    signOut();
    throw new Error('not_authenticated');
  }
}
