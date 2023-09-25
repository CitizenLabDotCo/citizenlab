import { setJwt } from 'utils/auth/jwt';
import { invalidateQueryCache } from 'utils/cl-react-query/resetQueryCache';
import signOut from './signOut';
import { API_PATH } from 'containers/App/constants';
import getAuthUser from '../auth_user/getAuthUser';
import fetcher from 'utils/cl-react-query/fetcher';

interface Parameters {
  email: string;
  password?: string;
  rememberMe?: boolean;
  tokenLifetime?: number;
}

export default async function signIn(parameters: Parameters) {
  try {
    await getAndSetToken(parameters);

    const authUser = await getAuthUserAsync();

    invalidateQueryCache();

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

  // TODO: Fix type after BE request data format updated

  const { jwt } = await fetcher<any>({
    path: `${API_PATH}/user_token`,
    action: 'post',
    body: bodyData,
  });
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
