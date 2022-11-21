import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { ImageSizes, Multiloc, Locale } from 'typings';
import { authApiEndpoint } from './auth';
import { TRole } from 'services/permissions/roles';

const apiEndpoint = `${API_PATH}/users`;

export interface IUserAttributes {
  first_name: string;
  // CL1 legacy: last names used to not be required
  // or when signing up with Google, it can be null too
  last_name: string | null;
  slug: string;
  locale: Locale;
  avatar?: ImageSizes;
  roles?: TRole[];
  highest_role: 'super_admin' | 'admin' | 'project_moderator' | 'user';
  bio_multiloc: Multiloc;
  registration_completed_at: string | null;
  created_at: string;
  updated_at: string;
  email?: string;
  gender?: 'male' | 'female' | 'unspecified';
  birthyear?: number;
  domicile?: string;
  education?: string;
  unread_notifications?: number;
  custom_field_values?: Record<string, any>;
  invite_status: 'pending' | 'accepted' | null;
  verified?: boolean;
  confirmation_required: boolean;
}

export interface IUserData {
  id: string;
  type: string;
  attributes: IUserAttributes;
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
  avatar?: string | null;
  roles?: TRole[];
  birthyear?: number;
  gender?: string;
  domicile?: string;
  education?: string;
  bio_multiloc?: Multiloc;
  custom_field_values?: Record<string, any>;
}

export function usersStream(streamParams: IStreamParams | null = null) {
  return streams.get<IUsers>({ apiEndpoint, ...streamParams });
}

export function userByIdStream(userId: string) {
  return streams.get<IUser>({ apiEndpoint: `${apiEndpoint}/${userId}` });
}

export function userBySlugStream(userSlug: string) {
  return streams.get<IUser>({
    apiEndpoint: `${apiEndpoint}/by_slug/${userSlug}`,
  });
}

export async function updateUser(userId: string, object: IUserUpdate) {
  const response = await streams.update<IUser>(
    `${apiEndpoint}/${userId}`,
    userId,
    { user: object }
  );

  await streams.fetchAllWith({
    dataId: [userId],
    apiEndpoint: [`${API_PATH}/groups`, `${API_PATH}/users`],
  });
  return response;
}

export async function deleteUser(userId: string) {
  const response = await streams.delete(`${apiEndpoint}/${userId}`, userId);
  await streams.fetchAllWith({
    apiEndpoint: [
      `${API_PATH}/groups`,
      `${API_PATH}/users`,
      `${API_PATH}/stats/users_count`,
    ],
  });
  return response;
}

export async function completeRegistration(
  customFieldValues?: Record<string, any>
) {
  const authUser = await streams.add<IUser>(
    `${apiEndpoint}/complete_registration`,
    { user: { custom_field_values: customFieldValues || {} } }
  );
  await streams.reset();
  await streams.fetchAllWith({
    apiEndpoint: [authApiEndpoint],
  });

  return authUser;
}
