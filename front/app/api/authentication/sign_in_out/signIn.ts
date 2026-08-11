import { API_PATH } from 'containers/App/constants';

import { getJwt, setJwt } from 'utils/auth/jwt';
import { queryClient } from 'utils/cl-react-query/queryClient';
import { invalidateQueryCache } from 'utils/cl-react-query/resetQueryCache';
import { clearClaimToken } from 'utils/claimToken';

import getAuthUser from '../auth_user/getAuthUser';

import signOut from './signOut';

interface Parameters {
  email: string;
  password: string;
  rememberMe?: boolean;
  tokenLifetime?: number;
  claimTokens?: string[];
}

export default async function signIn(parameters: Parameters) {
  try {
    await getAndSetToken(parameters);

    // Requests started before authentication carry the anonymous token, and
    // a decision-point read right after sign-in (queryClient.fetchQuery)
    // dedupes into any request still in flight — it would then see pre-login
    // data, e.g. stale group requirements that send a permitted user to
    // access-denied and drop the post-login success action. The identity
    // changed, so abort them.
    await queryClient.cancelQueries();

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
  claimTokens,
}: Parameters) {
  const bodyData = {
    auth: {
      email,
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
