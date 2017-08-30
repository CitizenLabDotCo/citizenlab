import { IUser } from 'services/users';
import { IHttpMethod } from 'typings.d';
import { API_PATH } from 'containers/App/constants';
import { getJwt, setJwt } from 'utils/auth/jwt';
import * as _ from 'lodash';
import request from 'utils/request';
import streams from 'utils/streams';
import { store } from 'app';
import { loadCurrentUserSuccess } from 'utils/auth/actions';
import { mergeJsonApiResources } from 'utils/resources/actions';

export interface IUserToken {
  jwt: string;
}

export async function signIn(email: string, password: string) {
  const bodyData = {
    auth: { email, password }
  };

  const httpMethod: IHttpMethod = {
    method: 'POST',
  };

  try {
    const { jwt } = await request<IUserToken>(`${API_PATH}/user_token`, bodyData, httpMethod, null);
    setJwt(jwt);
    const authenticatedUser = await getAuthUser();
    return authenticatedUser;
  } catch (error) {
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

export function observeCurrentUser() {
  return streams.create<IUser>({ apiEndpoint: `${API_PATH}/users/me` });
}

export async function getAuthUser() {
  const jwt = getJwt();

  if (!_.isString(jwt)) {
    throw new Error('no jwt token set in localstorage');
  } else {
    try {
      const authenticatedUser = await request<IUser>(`${API_PATH}/users/me`, null, null, null);

      if (authenticatedUser && _.has(authenticatedUser, 'data.id')) {
        store.dispatch(mergeJsonApiResources(authenticatedUser));
        store.dispatch(loadCurrentUserSuccess(authenticatedUser));
        return authenticatedUser;
      } else {
        throw new Error('not authenticated');
      }
    } catch (error) {
      throw new Error('not authenticated');
    }
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
