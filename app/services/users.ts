import { API_PATH } from 'containers/App/constants';
import streams, { IStream, IStreamParams } from 'utils/streams';
import request from 'utils/request';
import * as Rx from 'rxjs/Rx';
import * as _ from 'lodash';

import { Multiloc } from 'typings';

const apiEndpoint = `${API_PATH}/users`;

export interface IUserData {
  id: string;
  type: string;
  attributes: {
    first_name: string;
    last_name: string | null;
    slug: string;
    locale: string;
    avatar: {
      small: string;
      medium: string;
      large: string;
    },
    roles?: any[],
    bio_multiloc: {},
    created_at: string;
    updated_at: string;
    email?: string;
    gender?: 'male' | 'female' | 'unspecified';
    birthyear?: number;
    domicile?: string;
    education?: string;
    unread_notifications?: number;
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
  birthyear?: number;
  gender?: string;
  domicile?: string;
  education?: string;
  bio_multiloc?: Multiloc;
}

export function usersStream(streamParams: IStreamParams<IUsers> | null = null) {
  return streams.get<IUsers>({ apiEndpoint, ...streamParams });
}

export function userByIdStream(userId: string) {
  return streams.get<IUser>({ apiEndpoint: `${apiEndpoint}/${userId}` });
}

export function userBySlugStream(userSlug: string) {
  return streams.get<IUser>({ apiEndpoint: `${apiEndpoint}/by_slug/${userSlug}` });
}

export async function updateUser(userId: string, object: IUserUpdate) {
  return streams.update<IUser>(`${apiEndpoint}/${userId}`, userId, { user: object });
}

export async function deleteUser(userId: string) {
  return streams.delete(`${apiEndpoint}/${userId}`, userId);
}
