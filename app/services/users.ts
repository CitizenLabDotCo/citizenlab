import { API_PATH } from 'containers/App/constants';
import streams, { IStream, IStreamParams } from 'utils/streams';
import request from 'utils/request';
import * as Rx from 'rxjs/Rx';
import * as _ from 'lodash';

const apiEndpoint = `${API_PATH}/users`;

export interface IUserData {
  id: string;
  type: string;
  attributes: {
    first_name: string;
    last_name: string;
    slug: string;
    locale: string;
    avatar: {
      small: string;
      medium: string;
      large: string;
    },
    roles: any[],
    bio_multiloc: {},
    created_at: string;
    updated_at: string;
    email: string;
    gender: 'male' | 'female' | 'unspecified';
    birthyear: number;
    domicile: string;
    education: string;
  };
}

export interface IUserLinks {
  self: string;
  first: string;
  prev: string;
  next: string;
  last: string;
}

export interface IUsers {
  data: IUserData[];
  links: IUserLinks;
}

export interface IUser {
  data: IUserData;
}

export interface IUserUpdate {
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
  locale?: string;
  avatar?: string;
  roles?: any[];
  gender?: string;
  domicile?: string;
  education?: number;
  bio_multiloc?: {};
}

export function observeUsers(streamParams: IStreamParams<IUsers> | null = null) {
  return streams.create<IUsers>({ apiEndpoint, ...streamParams });
}

export function observeUser(userId: string, streamParams: IStreamParams<IUser> | null = null) {
  const extendedsStreamParams: IStreamParams<IUser> = { ...streamParams, requestedDataId: userId };
  return streams.create<IUser>({ apiEndpoint: `${apiEndpoint}/${userId}`, ...extendedsStreamParams });
}

export function updateUser(userId: string, object: IUserUpdate, refetch = true) {
  const httpMethod = { method: 'PUT' };
  const bodyData = { user: object };

  return request<IUser>(`${apiEndpoint}/${userId}`, bodyData, httpMethod, null).then((userObject) => {
    streams.update(userId, userObject, refetch);
  }).catch(() => {
    throw new Error(`error for updateUser() of service Users`);
  });
}

export function deleteUser(userId: string, refetch = true) {
  const httpMethod = { method: 'DELETE' };

  return request<IUser>(`${apiEndpoint}/${userId}`, null, httpMethod, null).then((userObject) => {
    streams.delete(userId, refetch);
  }).catch(() => {
    throw new Error(`error for deleteUser() of service Users`);
  });
}
