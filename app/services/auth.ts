import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';
import { IUser } from 'services/users';
import { IHttpMethod } from 'typings.d';
import { API_PATH } from 'containers/App/constants';
import { getJwt, setJwt, removeJwt } from 'utils/auth/jwt';
import request from 'utils/request';
import streams, { IStream } from 'utils/streams';
import { store } from 'app';
import { loadCurrentUserSuccess } from 'utils/auth/actions';
import { mergeJsonApiResources } from 'utils/resources/actions';

export interface IUserToken {
  jwt: string;
}

export function authUserStream() {
  return streams.get<IUser>({ apiEndpoint: `${API_PATH}/users/me` });
}

export async function signIn(email: string, password: string) {
  const bodyData = { auth: { email, password } };

  const httpMethod: IHttpMethod = {
    method: 'POST',
  };

  try {
    const { jwt } = await request<IUserToken>(`${API_PATH}/user_token`, bodyData, httpMethod, null);
    setJwt(jwt);
    const authenticatedUser = await getAuthUserAsync();
    const authStream = authUserStream();
    authStream.observer !== null && authStream.observer.next(authenticatedUser);
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
  locale: string,
  selectedGender: 'male' | 'female' | 'unspecified' | null = null,
  selectedYearOfBirth: number | null = null,
  selectedAreaId: string | null = null
) {
  const bodyData = {
    user: {
      email,
      password,
      locale,
      first_name: firstName,
      last_name: lastName,
      gender: selectedGender,
      birthyear: selectedYearOfBirth,
      domicile: selectedAreaId,
    }
  };

  const httpMethod: IHttpMethod = {
    method: 'POST'
  };

  try {
    await request(`${API_PATH}/users`, bodyData, httpMethod, null);
    const authenticatedUser = await signIn(email, password);
    return authenticatedUser;
  } catch (error) {
    throw error;
  }
}

export function signOut() {
  removeJwt();
  const authStream = authUserStream();
  authStream.observer !== null && authStream.observer.next(null);
}

export async function getAuthUserAsync() {
  try {
    const authenticatedUser = await request<IUser>(`${API_PATH}/users/me`, null, null, null);
    return authenticatedUser;
  } catch {
    signOut();
    throw new Error('not authenticated');
  }
}

export function sendPasswordResetMail(email: string) {
  const bodyData = {
    user: {
      email
    }
  };

  const httpMethod: IHttpMethod = {
    method: 'POST'
  };

  return request(`${API_PATH}/users/reset_password_email`, bodyData, httpMethod, null).catch((error) => {
    throw error;
  });
}
