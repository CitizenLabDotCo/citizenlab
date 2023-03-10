import { IUser, deleteUser } from 'services/users';
import { API_PATH, AUTH_PATH } from 'containers/App/constants';
import { getJwt, removeJwt, decode } from 'utils/auth/jwt';
import streams from 'utils/streams';
import clHistory from 'utils/cl-router/history';
import { resetQueryCache } from 'utils/cl-react-query/resetQueryCache';

export const authApiEndpoint = `${API_PATH}/users/me`;

export interface IUserToken {
  jwt: string;
}

export function authUserStream() {
  return streams.get<IUser | null>({ apiEndpoint: authApiEndpoint });
}

export interface ILockedField {
  type: 'locked_attribute';
  id: string;
  attributes: {
    name: 'first_name' | 'last_name' | 'email';
  };
}

export function lockedFieldsStream() {
  return streams.get<{ data: ILockedField[] }>({
    apiEndpoint: `${authApiEndpoint}/locked_attributes`,
  });
}

export function signOutAndDeleteAccount() {
  return new Promise((resolve, _reject) => {
    const jwt = getJwt();

    if (jwt) {
      const decodedJwt = decode(jwt);

      const { provider, sub } = decodedJwt;

      deleteUser(sub)
        .then(async (_res) => {
          removeJwt();
          if (decodedJwt.logout_supported) {
            const url = `${AUTH_PATH}/${provider}/logout?user_id=${sub}`;
            window.location.href = url;
          } else {
            await streams.reset();
            await resetQueryCache();
          }
          clHistory.push('/');
          resolve(true);
        })
        .catch((_res) => {
          resolve(false);
        });
    }
  });
}
