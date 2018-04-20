import { IUser } from 'services/users';
import { IHttpMethod, Locale } from 'typings';
import { API_PATH } from 'containers/App/constants';
import { getJwt, setJwt, removeJwt } from 'utils/auth/jwt';
import request from 'utils/request';
import streams from 'utils/streams';
import { browserHistory } from 'react-router';

// legacy redux stuff
import { store } from 'app';
import {  STORE_JWT } from 'utils/auth/constants';

export const authApiEndpoint = `${API_PATH}/users/me`;

export interface IUserToken {
  jwt: string;
}

export function authUserStream() {
  return streams.get<IUser | null>({ apiEndpoint: authApiEndpoint });
}

export async function signIn(email: string, password: string) {
  try {
    const bodyData = { auth: { email, password } };
    const httpMethod: IHttpMethod = { method: 'POST' };
    const { jwt } = await request<IUserToken>(`${API_PATH}/user_token`, bodyData, httpMethod, null);
    setJwt(jwt);
    store.dispatch({ type: STORE_JWT, payload: jwt });
    const authenticatedUser = await getAuthUserAsync();
    streams.reset();
    authUserStream().observer.next(authenticatedUser);
    return authenticatedUser;
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
    last_name: lastName
  };

  const httpMethod: IHttpMethod = {
    method: 'POST'
  };

  try {
    const signUpEndpoint = (isInvitation === true ? `${API_PATH}/invites/by_token/${token}/accept` : `${API_PATH}/users`);
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
    removeJwt();
    streams.reset();
    authUserStream().observer.next(null);

    const currentLocation = browserHistory.getCurrentLocation();

    if (currentLocation.pathname.startsWith('/admin')) {
      browserHistory.push('/');
    }
  }
}

export async function getAuthUserAsync() {
  try {
    const authenticatedUser = await request<IUser>(authApiEndpoint, null, null, null);
    return authenticatedUser;
  } catch {
    signOut();
    throw new Error('not_authenticated');
  }
}

export async function sendPasswordResetMail(email: string) {
  try {
    const bodyData = {
      user: {
        email
      }
    };
    const httpMethod: IHttpMethod = { method: 'POST' };
    const response = await request(`${API_PATH}/users/reset_password_email`, bodyData, httpMethod, null);
    return response;
  } catch (error) {
    throw error;
  }
}

export async function resetPassword(password: string, token: string) {
  try {
    const bodyData = {
      user: {
        password,
        token
      }
    };
    const httpMethod: IHttpMethod = { method: 'POST' };
    const response = await request(`${API_PATH}/users/reset_password`, bodyData, httpMethod, null);
    return response;
  } catch (error) {
    throw error;
  }
}
