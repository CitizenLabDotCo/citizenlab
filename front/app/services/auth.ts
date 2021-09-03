import { IUser, deleteUser } from 'services/users';
import { IHttpMethod, Locale } from 'typings';
import { API_PATH, AUTH_PATH } from 'containers/App/constants';
import { getJwt, setJwt, removeJwt, decode } from 'utils/auth/jwt';
import { endsWith } from 'utils/helperUtils';
import request from 'utils/request';
import streams from 'utils/streams';
import clHistory from 'utils/cl-router/history';
import { removeLocale } from 'utils/cl-router/updateLocationDescriptor';
import eventEmitter from 'utils/eventEmitter';

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

export async function signIn(email: string, password: string) {
  try {
    const bodyData = { auth: { email, password } };
    const httpMethod: IHttpMethod = { method: 'POST' };
    const { jwt } = await request<IUserToken>(
      `${API_PATH}/user_token`,
      bodyData,
      httpMethod,
      null
    );
    setJwt(jwt);
    const authUser = await getAuthUserAsync();
    await streams.reset();
    return authUser;
  } catch (error) {
    signOut();
    throw error;
  }
}

export async function signUp(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  locale: Locale,
  isInvitation: boolean | null | undefined,
  token: string | undefined | null
) {
  const innerBodyData = {
    email,
    password,
    locale,
    first_name: firstName,
    last_name: lastName,
  };

  const httpMethod: IHttpMethod = {
    method: 'POST',
  };

  // eslint-disable-next-line no-useless-catch
  try {
    const signUpEndpoint =
      isInvitation === true
        ? `${API_PATH}/invites/by_token/${token}/accept`
        : `${API_PATH}/users`;
    const bodyData = { [token ? 'invite' : 'user']: innerBodyData };
    await request(signUpEndpoint, bodyData, httpMethod, null);
    const authenticatedUser = await signIn(email, password);
    return authenticatedUser;
  } catch (error) {
    throw error;
  }
}

export function signOut() {
  const jwt = getJwt();

  if (jwt) {
    const decodedJwt = decode(jwt);

    removeJwt();

    if (decodedJwt.logout_supported) {
      const { provider, sub } = decodedJwt;
      const url = `${AUTH_PATH}/${provider}/logout?user_id=${sub}`;
      window.location.href = url;
    } else {
      streams.reset();
      const { pathname } = removeLocale(location.pathname);

      if (
        pathname &&
        (endsWith(pathname, '/sign-up') || pathname.startsWith('/admin'))
      ) {
        clHistory.push('/');
      }
    }
  }
}

export function signOutAndDeleteAccountPart1() {
  setTimeout(() => eventEmitter.emit('tryAndDeleteProfile'), 500);
  clHistory.push('/');
}

export function signOutAndDeleteAccountPart2() {
  return new Promise((resolve, _reject) => {
    const jwt = getJwt();

    if (jwt) {
      const decodedJwt = decode(jwt);

      const { provider, sub } = decodedJwt;

      deleteUser(sub)
        .then((_res) => {
          removeJwt();
          if (decodedJwt.logout_supported) {
            const url = `${AUTH_PATH}/${provider}/logout?user_id=${sub}`;
            window.location.href = url;
          } else {
            streams.reset();
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

export async function getAuthUserAsync() {
  try {
    const authenticatedUser = await request<IUser>(
      authApiEndpoint,
      null,
      null,
      null
    );
    return authenticatedUser;
  } catch {
    signOut();
    throw new Error('not_authenticated');
  }
}

export async function sendPasswordResetMail(email: string) {
  // eslint-disable-next-line no-useless-catch
  try {
    const bodyData = {
      user: {
        email,
      },
    };
    const httpMethod: IHttpMethod = { method: 'POST' };
    const response = await request(
      `${API_PATH}/users/reset_password_email`,
      bodyData,
      httpMethod,
      null
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export async function resetPassword(password: string, token: string) {
  // eslint-disable-next-line no-useless-catch
  try {
    const bodyData = {
      user: {
        password,
        token,
      },
    };
    const httpMethod: IHttpMethod = { method: 'POST' };
    const response = await request(
      `${API_PATH}/users/reset_password`,
      bodyData,
      httpMethod,
      null
    );
    return response;
  } catch (error) {
    throw error;
  }
}
