import { API_PATH } from 'containers/App/constants';

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
  claimTokens?: string[];
};

export default async function signIn(parameters: Parameters) {
  try {
    await requestAuthCookie(parameters);

    const authUser = await getAuthUserAsync();

    invalidateQueryCache();

    return authUser;
  } catch (error) {
    signOut();
    throw error;
  }
}

// On success, the API sets the auth token in an HttpOnly cookie, which the browser
// then sends along with every API request. This code never sees the token.
async function requestAuthCookie({
  email,
  phone,
  password,
  rememberMe = false,
  claimTokens,
}: Parameters) {
  // Each identifier has its own endpoint: they look the account up differently
  // and each one requires that identifier to have been confirmed.
  const endpoint = phone ? 'user_token_phone' : 'user_token';

  const bodyData = {
    auth: {
      ...(phone ? { phone } : { email }),
      password,
      remember_me: rememberMe,
      claim_tokens: claimTokens,
    },
  };

  const response = await fetch(`${API_PATH}/${endpoint}`, {
    method: 'POST',
    credentials: 'include', // Include cookies (session, auth tokens)
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bodyData),
  });

  if (!response.ok) {
    throw new Error(`Sign in failed with status ${response.status}`);
  }

  clearClaimToken();
}

async function getAuthUserAsync() {
  try {
    return await getAuthUser();
  } catch {
    signOut();
    throw new Error('not_authenticated');
  }
}
