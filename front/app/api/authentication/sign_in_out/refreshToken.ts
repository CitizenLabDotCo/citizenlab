import { API_PATH } from 'containers/App/constants';

import { getJwt, setJwt } from 'utils/auth/jwt';

export default async function refreshToken() {
  const jwt = getJwt();

  const response = await fetch(`${API_PATH}/user_token/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }

  const data = await response.json();
  setJwt(data.jwt, false);
}
