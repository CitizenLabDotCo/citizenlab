import { setJwt } from 'utils/auth/jwt';
import streams from 'utils/streams';
import { resetQueryCache } from 'utils/cl-react-query/resetQueryCache';
import signOut from './signOut';
import { API_PATH } from 'containers/App/constants';
import request from 'utils/request';
import { IHttpMethod } from 'typings';
import getAuthUser from '../auth_user/getAuthUser';

interface Parameters {
  email: string;
  password?: string;
  rememberMe?: boolean;
  tokenLifetime?: number;
}

interface IUserToken {
  jwt: string;
}

export default async function signIn(parameters: Parameters) {
  try {
    await getAndSetToken(parameters);

    const authUser = await getAuthUserAsync();

    await streams.reset();
    await resetQueryCache();

    return authUser;
  } catch (error) {
    signOut();
    throw error;
  }
}

export async function getAndSetToken({
  email,
  password = '',
  rememberMe = false,
  tokenLifetime,
}: Parameters) {
  const bodyData = { auth: { email, password, remember_me: rememberMe } };
  const httpMethod: IHttpMethod = { method: 'POST' };

  // TODO: Replace request with fetcher after BE request data format updated
  const { jwt } = await request<IUserToken>(
    `${API_PATH}/user_token`,
    bodyData,
    httpMethod,
    null
  );

  setJwt(jwt, rememberMe, tokenLifetime);
}

async function getAuthUserAsync() {
  try {
    return await getAuthUser();
  } catch {
    signOut();
    throw new Error('not_authenticated');
  }
}
