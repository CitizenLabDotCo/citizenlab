import meKeys from 'api/me/keys';

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

    const authUser = await getAuthUserAsync();

    // Post-sign-in success actions (SuccessActions) wait on authUserStream —
    // a BehaviorSubject fed by the me query — and treat a null value as
    // "signed out", discarding the action rather than retrying. Leaving the me
    // query to be refreshed by the invalidation below is asynchronous, so the
    // stream could still be replaying the logged-out null when an action ran,
    // silently dropping it (e.g. the redirect to the idea form after signing in
    // from the "Add an idea" button). Seed the query with the user we just
    // fetched so the stream reflects the signed-in user before any action runs.
    queryClient.setQueryData(meKeys.all(), authUser);

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
