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

export function signIn(email: string, password: string) {
  const bodyData = {
    auth: { email, password }
  };

  const httpMethod: IHttpMethod = {
    method: 'POST',
  };

  return request<IUserToken>(`${API_PATH}/user_token`, bodyData, httpMethod, null).then((data) => {
    data && setJwt(data.jwt);
    return data.jwt;
  }).catch((error) => {
    throw error;
  });
}

export function signUp(
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

  return request(`${API_PATH}/users`, bodyData, httpMethod, null).then(() => {
    return { email, password };
  }).catch((error) => {
    throw error;
  });
}

export function observeCurrentUser() {
  return streams.create<IUser>({ apiEndpoint: `${API_PATH}/users/me` });
}

export function getAuthUser() {
  return request<IUser>(`${API_PATH}/users/me`, null, null, null).then((response: IUser) => {
    if (response && _.has(response, 'data.id')) {

      // Sync redux state
      store.dispatch(mergeJsonApiResources(response));
      store.dispatch(loadCurrentUserSuccess(response));

      return response;
    } else {
      throw new Error('not authenticated');
    }
  }).catch((error) => {
    throw new Error('not authenticated');
  });
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
