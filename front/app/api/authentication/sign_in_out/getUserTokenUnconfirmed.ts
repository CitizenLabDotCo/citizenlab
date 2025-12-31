import { API_PATH } from 'containers/App/constants';

import { setJwt } from 'utils/auth/jwt';
import { invalidateQueryCache } from 'utils/cl-react-query/resetQueryCache';
import { clearClaimTokens, getClaimTokens } from 'utils/claimToken';

import signOut from './signOut';

export default async function getUserTokenUnconfirmed(email: string) {
  try {
    await getAndSetToken(email);
    invalidateQueryCache();
  } catch (error) {
    signOut();
    throw error;
  }
}

async function getAndSetToken(email: string) {
  const bodyData = {
    auth: {
      email,
      claim_tokens: getClaimTokens(),
    },
  };

  return await fetch(`${API_PATH}/user_token/unconfirmed`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bodyData),
  })
    .then((response) => response.json())
    .then((data) => {
      setJwt(data.jwt, false);
      clearClaimTokens();
    });
}
