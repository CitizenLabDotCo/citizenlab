import { API_PATH } from 'containers/App/constants';

import { getJwt, setJwt } from 'utils/auth/jwt';
import { invalidateQueryCache } from 'utils/cl-react-query/resetQueryCache';
import { clearClaimToken } from 'utils/claimToken';

import getAuthUser from '../auth_user/getAuthUser';

import signOut from './signOut';

// Users sign in with either their email address or their phone number.
type Identifier =
  | { email: string; phone?: never }
  | { phone: string; email?: never };

type Parameters = Identifier & {
  password: string;
  rememberMe?: boolean;
  tokenLifetime?: number;
  claimTokens?: string[];
};

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
  phone,
  password,
  rememberMe = false,
  tokenLifetime,
  claimTokens,
}: Parameters) {
  const bodyData = {
    auth: {
      ...(phone ? { phone } : { email }),
      password,
      remember_me: rememberMe,
      claim_tokens: claimTokens,
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
      clearClaimToken();
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
