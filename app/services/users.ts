import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { API, Multiloc, Locale } from 'typings';

const apiEndpoint = `${API_PATH}/users`;

export interface IRole {
  type: string;
  [key: string]: string;
}

export interface IUserData {
  id: string;
  type: string;
  attributes: {
    first_name: string;
    last_name: string | null;
    slug: string;
    locale: Locale;
    avatar: API.ImageSizes,
    roles?: IRole[],
    bio_multiloc: Multiloc,
    created_at: string;
    updated_at: string;
    email?: string;
    gender?: 'male' | 'female' | 'unspecified';
    birthyear?: number;
    domicile?: string;
    education?: string;
    unread_notifications?: number;
    custom_field_values: object;
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
  custom_field_values?: object;
}

export function usersStream(streamParams: IStreamParams | null = null) {
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

export function mapUserToDiff(user: IUserData): IUserUpdate {
  return {
    first_name: user.attributes.first_name || undefined,
    last_name: user.attributes.last_name || undefined,
    email: user.attributes.email || undefined,
    locale: user.attributes.locale || undefined,
    birthyear: user.attributes.birthyear || undefined,
    gender: user.attributes.gender || undefined,
    domicile: user.attributes.domicile || undefined,
    education: user.attributes.education || undefined,
    bio_multiloc: user.attributes.bio_multiloc || undefined,
  };
}
