import { API_PATH } from 'containers/App/constants';

import { getJwt, setJwt } from 'utils/auth/jwt';
import { invalidateQueryCache } from 'utils/cl-react-query/resetQueryCache';
import { getClaimTokens, clearClaimTokens } from 'utils/claimToken';

import getAuthUser from '../auth_user/getAuthUser';

import signOut from './signOut';

interface Parameters {
  email: string;
  password: string;
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

async function getAndSetToken({
  email,
  password,
  rememberMe = false,
  tokenLifetime,
}: Parameters) {
  const bodyData = {
    auth: {
      email,
      password,
      remember_me: rememberMe,
      claim_tokens: getClaimTokens(),
    },
  };

  const jwt = getJwt();
  return await fetch(`${API_PATH}/user_token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify(bodyData),
  })
    .then((response) => response.json())
    .then((data) => {
      setJwt(data.jwt, rememberMe, tokenLifetime);
      clearClaimTokens();
    });
}

async function getAuthUserAsync() {
  try {
    return await getAuthUser();
  } catch {
    signOut();
    throw new Error('not_authenticated');
  }
}
